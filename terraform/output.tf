output "aws_instance_public_ip"{
    description = "EC2 instance Public Ip address"
	value=aws_instance.ec2-instance.public_ip
}

output "alb_dns_name" {
  description = "The public URL of the Application Load Balancer"
  value       = aws_lb.application_lb.dns_name
}