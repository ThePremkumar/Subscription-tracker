variable "ami" {
    description = "ami id for the instance"
    type = string
}

variable "instance_type" {
    description = "instance type for the instance"
}

variable "region" {
    description = "region for this instance"
}

variable "vpc_id" {
  description = "vpc id for this instance"
}

variable "sg_id" {
  description = "sg id for this instance"
}

variable "instance_name" {
  description = "Instance name"
}

variable "public_subnet_ids" {
  description = "Instance name"
  type = list(string)
}

variable "key_pair" {
  description = "Key pair for this instance"
}

variable "bucket" {
  description = "Bucket name for backend"
}