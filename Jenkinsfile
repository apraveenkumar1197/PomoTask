// Jenkinsfile
//
// Single pipeline that builds Docker images for both the Django backend
// and the React Native (Expo web) frontend, then (re)runs them as
// standalone containers:
//   - Django backend   -> host port 4310
//   - React Native web -> host port 4392
//
// Requires a Jenkins agent with Docker installed and the Jenkins user
// able to run docker commands (e.g. member of the "docker" group on Linux).
// See README.md "CI/CD Deployment (Jenkins)" section for the credentials
// that must be configured before running this pipeline.

pipeline {
    agent any

    environment {
        DJANGO_IMAGE           = 'pomotask-django'
        DJANGO_CONTAINER       = 'pomotask-django'
        DJANGO_HOST_PORT       = '4310'

        REACT_NATIVE_IMAGE     = 'pomotask-react-native'
        REACT_NATIVE_CONTAINER = 'pomotask-react-native'
        REACT_NATIVE_HOST_PORT = '4392'
    }

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare env files') {
            steps {
                // Both Dockerfiles COPY the full build context, so the .env
                // files must exist on disk before "docker build" runs.
                withCredentials([
                    file(credentialsId: 'pomotask-django-env', variable: 'DJANGO_ENV_FILE'),
                    file(credentialsId: 'pomotask-react-native-env', variable: 'RN_ENV_FILE')
                ]) {
                    sh '''
                        cp "$DJANGO_ENV_FILE" django/.env
                        cp "$RN_ENV_FILE" react-native/.env
                    '''
                }
            }
        }

        stage('Build & deploy Django') {
            steps {
                sh """
                    docker build -t ${DJANGO_IMAGE}:latest ./django
                    docker rm -f ${DJANGO_CONTAINER} || true
                    docker run -d \
                        --name ${DJANGO_CONTAINER} \
                        --restart unless-stopped \
                        -p ${DJANGO_HOST_PORT}:8000 \
                        ${DJANGO_IMAGE}:latest
                """
            }
        }

        stage('Build & deploy React Native') {
            steps {
                sh """
                    docker build -t ${REACT_NATIVE_IMAGE}:latest ./react-native
                    docker rm -f ${REACT_NATIVE_CONTAINER} || true
                    docker run -d \
                        --name ${REACT_NATIVE_CONTAINER} \
                        --restart unless-stopped \
                        -p ${REACT_NATIVE_HOST_PORT}:80 \
                        ${REACT_NATIVE_IMAGE}:latest
                """
            }
        }

        stage('Cleanup dangling images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo "Deployed: Django -> http://<host>:${DJANGO_HOST_PORT}  |  React Native web -> http://<host>:${REACT_NATIVE_HOST_PORT}"
        }
        failure {
            echo 'Pomotask deployment failed. Check the stage logs above.'
        }
    }
}
