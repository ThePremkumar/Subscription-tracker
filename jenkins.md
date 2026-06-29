# 🔧 Jenkins — CI/CD Pipeline

Automated CI/CD pipeline that builds, tests, and deploys on every git push.

## Pipeline Stages

```
git push → GitHub webhook → Jenkins
    ↓
Stage 1: Checkout
    ↓
Stage 2: SonarQube Analysis
    ↓
Stage 3: Quality Gate
    ↓
Stage 4: Docker Build (parallel)
    ├── Build Frontend Image
    └── Build Backend Image
    ↓
Stage 5: Docker Push to DockerHub
    ↓
Stage 6: Deploy via Ansible
    ↓
App Updated on AWS ✅
```

## Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "thepremkumar/subscriptiontracker-backend"
        FRONTEND_IMAGE = "thepremkumar/subscriptiontracker-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/ThePremkumar/Subscription-tracker.git']]
                )
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonarqube_Cloud') {
                    withEnv(["PATH+SONAR=/opt/sonar-scanner/bin"]) {
                        sh """
                            sonar-scanner \
                                -Dsonar.organization=thepremkumar \
                                -Dsonar.projectKey=ThePremkumar_Subscription-tracker \
                                -Dsonar.sources=backend \
                                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.git/** \
                                -Dsonar.host.url=https://sonarcloud.io \
                                -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Frontend') {
                    steps {
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend"
                    }
                }
                stage('Backend') {
                    steps {
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh "echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Deploy') {
            steps {
                sh "ansible-playbook -i ./ansible/inventory.ini ./ansible/playbook.yml"
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            sh 'docker logout'
            cleanWs()
        }
    }
}
```

## Jenkins Setup

### Server Requirements
- EC2 t3.small (minimum)
- Java 21 (Jenkins latest requires Java 21)
- Docker installed
- Ansible installed
- SonarScanner installed at `/opt/sonar-scanner`

### Plugins Required
- Git
- Pipeline
- Docker Pipeline
- SonarQube Scanner
- Ansible
- Blue Ocean
- GitHub Integration

### Global Environment Variables
Set in `Manage Jenkins → Configure System → Global Properties`:
```
DOCKERHUB_USER = thepremkumar
DOCKERHUB_PASS = your-password
SONAR_TOKEN    = your-sonarcloud-token
```

### SonarQube Configuration
`Manage Jenkins → System → SonarQube servers`:
```
Name: Sonarqube_Cloud
URL:  https://sonarcloud.io
```

### SonarScanner Installation
```bash
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-x64.zip
sudo unzip sonar-scanner-cli-6.2.1.4610-linux-x64.zip
sudo mv sonar-scanner-6.2.1.4610-linux-x64 sonar-scanner
sudo ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
```

## GitHub Webhook

`GitHub Repo → Settings → Webhooks → Add webhook`:
```
Payload URL: http://jenkins-ip:8080/github-webhook/
Content type: application/json
Events: Push events
```

## Key Learnings

- Jenkins latest requires Java 21 (not 17)
- Single quotes in shell don't expand variables — use double quotes
- SonarScanner can hang on memory-constrained instances
- Parallel builds cut Docker build time in half
- `cleanWs()` prevents disk space issues on Jenkins
- `docker logout` after push for security
- SonarCloud Automatic Analysis must be disabled when using Jenkins