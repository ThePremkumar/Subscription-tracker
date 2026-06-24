terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "subscriptiontrackerapi"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}


#VPC setup

data "aws_vpc" "existing_vpc" {
  id = var.vpc_id
}


#Security Group
data "aws_security_group" "sg" {
  id = var.sg_id
}


#instance creation
resource "aws_instance" "ec2-instance" {
  ami = var.ami
  instance_type = var.instance_type
  tags = {
    Name = var.instance_name
  }
  associate_public_ip_address = true
  vpc_security_group_ids      = [data.aws_security_group.sg.id]

  subnet_id = var.public_subnet_ids[0]
  user_data = file("${path.module}/userdata.sh")

  key_name = var.key_pair
}


# Application Load Balancer (Deployed in Public Subnets)
resource "aws_lb" "application_lb" {
  name               = "public-application-alb"
  internal           = false # "false" makes it internet-facing (public)
  load_balancer_type = "application"
  security_groups    = [data.aws_security_group.sg.id]
  subnets            = var.public_subnet_ids # Must provide at least two public subnet IDs

  enable_deletion_protection = false

  tags = {
    Environment = "production"
  }
}

#Target Group Pointing to EC2 Instances on Port 80

resource "aws_lb_target_group" "app_tg" {
  name     = "ec2-port80-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.existing_vpc.id

  depends_on = [aws_lb.application_lb]  # ← add this

  health_check {
    path    = "/"
    matcher = "200"
  }
}

# ALB Listener on Port 80 Forwarding to the Target Group

resource "aws_lb_listener" "app_listener" {
    load_balancer_arn = aws_lb.application_lb.arn
    port = 80
    protocol = "HTTP"

    default_action {
      type = "forward"
      target_group_arn = aws_lb_target_group.app_tg.arn
    }
  
}

resource "aws_lb_target_group_attachment" "app_attachment" {
  target_group_arn = aws_lb_target_group.app_tg.arn
  target_id        = aws_instance.ec2-instance.id
  port             = 80
}


