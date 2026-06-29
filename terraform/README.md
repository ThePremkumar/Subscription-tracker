# 🏗️ Terraform — AWS Infrastructure as Code

Provisions complete AWS infrastructure for the Subscription Tracker application.

## Structure

```
terraform/
├── main.tf           # Core resources (EC2, ALB, VPC, SG)
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── provider.tf       # AWS provider config
├── backend.tf        # S3 remote state
├── userdata.sh       # EC2 bootstrap script
└── terraform.tfvars  # Variable values (gitignored)
```

## Infrastructure Created

```
VPC
└── Public Subnet (us-east-1a + us-east-1b)
    ├── EC2 Instance (t3.micro)
    │   └── Docker containers (frontend + backend)
    ├── ALB (Application Load Balancer)
    │   ├── Listener (port 80)
    │   └── Target Group → EC2:80
    └── Security Group
        ├── Inbound: 22, 80, 3000
        └── Outbound: all
```

## Resources

| Resource | Description |
|----------|-------------|
| `aws_instance` | EC2 running Docker containers |
| `aws_lb` | Application Load Balancer |
| `aws_lb_target_group` | Routes traffic to EC2 |
| `aws_lb_listener` | Listens on port 80 |
| `aws_lb_target_group_attachment` | Links EC2 to target group |

## Variables

| Variable | Description |
|----------|-------------|
| `ami` | Amazon Linux 2023 AMI ID |
| `instance_type` | EC2 instance size |
| `region` | AWS region |
| `vpc_id` | VPC to deploy into |
| `sg_id` | Security group ID |
| `public_subnet_ids` | List of 2 public subnets |
| `key_pair` | SSH key pair name |

## userdata.sh

Bootstraps EC2 on first boot:
1. Updates system packages
2. Installs Docker
3. Installs Docker Compose v2
4. Starts Docker service
5. Creates docker-compose.yml
6. Pulls images from DockerHub
7. Starts containers

## Commands

```bash
# Initialize
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy everything
terraform destroy
```

## Outputs

```
alb_dns_name        = "public-application-alb-xxx.us-east-1.elb.amazonaws.com"
aws_instance_public_ip = "x.x.x.x"
```

## Key Learnings

- Variables NOT allowed in backend blocks — hardcode bucket and region
- ALB requires minimum 2 subnets in different AZs
- Use `vpc_security_group_ids` not `security_groups` for VPC instances
- ALB VPC cannot be changed after creation — must destroy and recreate
- Remote state S3 bucket must exist before `terraform init`