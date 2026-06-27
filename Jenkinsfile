pipeline{
    agent any
    environment {
        BACKEND_IMAGE = "thepremkumar/subscriptiontracker-backend"
        FRONTEND_IMAGE = "thepremkumar/subscriptiontracker-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }
    stages{
        stage('checkout'){
            steps{
                // checkout scmGit(
                //     branches: [[name: '*/main']],
                //     userRemoteConfigs:[[url: 'https://github.com/ThePremkumar/Subscription-tracker.git']]
                // )
                //(or)
                //checkout scm only works when Jenkins already knows which Git repository the pipeline came from.
                checkout scm
            }
        }
        stage("build & SonarQube analysis") {
            steps{
                withSonarQubeEnv('Sonarqube_Cloud'){
                    sh """
                        sonar-scanner \
                            -Dsonar.organization=thepremkumar \
                            -Dsonar.projectKey=ThePremkumar_Subscription-tracker \
                            -Dsonar.sources=backend \
                            -Dsonar.host.url=https://sonarcloud.io \
                            -Dsonar.login=5854569f-8614-4748-8f7e-456fb313678e
                    """
                }  
            }
        }

        stage("Quality Gate"){
            steps { 
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage("Docker Build"){
            parallel{
                stage('frontend'){
                    steps{
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend"
                    }
                }
                stage('backend'){
                    steps{
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
                    }
                }
            }
        }
        stage("Docker Push"){
            steps{
                sh "echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
            } 
        }
        stage("Deploy"){
            steps{
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
        always{
            sh 'docker logout'
            cleanWs()
        }
    }
    
}