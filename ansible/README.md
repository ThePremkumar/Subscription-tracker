# ⚙️ Ansible — Configuration Management

Automates EC2 server configuration and application deployment.

## Structure

```
ansible/
├── playbook.yml              # Main playbook
├── inventory.ini             # Target servers
├── ansible.cfg               # Ansible configuration
└── roles/
    └── docker/
        ├── tasks/
        │   └── main.yml      # All tasks
        └── files/
            └── docker-compose.yml  # Deployed to server
```

## What It Does

Runs automatically on target EC2 and:

1. Updates system packages
2. Installs Docker
3. Installs Docker Compose v2 plugin
4. Starts and enables Docker service
5. Adds ec2-user to docker group
6. Copies docker-compose.yml to server
7. Pulls images and starts containers

## Files

### inventory.ini
```ini
[webservers]
your-ec2-ip ansible_user=ec2-user
```

### ansible.cfg
```ini
[defaults]
inventory = inventory.ini
host_key_checking = False
remote_user = ec2-user
```

### playbook.yml
```yaml
- hosts: webservers
  become: true
  roles:
    - docker
```

### roles/docker/tasks/main.yml
```yaml
- name: update the system package
  dnf:
    name: "*"
    state: latest

- name: install docker
  dnf:
    name: docker
    state: present

- name: install docker compose v2 plugin
  shell: |
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  args:
    creates: /usr/local/lib/docker/cli-plugins/docker-compose

- name: start and enable docker
  systemd:
    name: docker
    state: started
    enabled: yes

- name: add ec2-user to docker group
  user:
    name: ec2-user
    groups: docker
    append: yes

- name: copy docker-compose.yml to server
  copy:
    src: docker-compose.yml
    dest: /home/ec2-user/docker-compose.yml
    mode: "0755"

- name: run docker compose
  command: docker compose up -d
  args:
    chdir: /home/ec2-user
```

## Commands

```bash
# Test connection
ansible all -m ping

# Run playbook
ansible-playbook playbook.yml

# Run with verbose output
ansible-playbook playbook.yml -v

# Check syntax
ansible-playbook playbook.yml --syntax-check

# Dry run
ansible-playbook playbook.yml --check
```

## SSH Setup (ssh-keygen method)

```bash
# On Ansible master
ssh-keygen -t rsa -b 2048

# Copy public key to target server
ssh-copy-id ec2-user@target-ip

# Test
ssh ec2-user@target-ip
```

## Successful Run Output

```
PLAY RECAP
x.x.x.x : ok=7  changed=5  unreachable=0  failed=0
```

`failed=0` = success ✅

## Key Learnings

- `docker-compose-plugin` not available in AL2023 dnf — install via curl
- Use `systemd` module not `yum` for service management
- `enabled: yes` not `enable: yes` in systemd module
- Use `groups` (plural) not `group` in user module
- `state=started` is for service module, not yum/dnf