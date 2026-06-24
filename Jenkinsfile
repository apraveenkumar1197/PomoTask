// Jenkinsfile
//
// Single pipeline that deploys the whole stack via the root docker-compose.yml:
//   - mongo            -> persistent volume (pomotask_mongo_data), internal only
//   - django backend   -> host port 4310
//   - react-native web -> host port 4392
//
// Requires a Jenkins agent with Docker + the Docker Compose plugin (the
// "docker compose" CLI) installed, and the Jenkins user able to run docker
// commands (e.g. member of the "docker" group on Linux).
// See README.md "CI/CD Deployment (Jenkins)" section for the credentials
// that must be configured before running this pipeline.

pipeline {
    agent any

    environment {
        DJANGO_HOST_PORT       = '4310'
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
                // docker-compose.yml bakes django/.env and react-native/.env
                // into their respective images at build time, and reads the
                // root .env for the Mongo root credentials. All three must
                // exist before "docker compose up" runs.
                withCredentials([
                    file(credentialsId: 'pomotask-root-env', variable: 'ROOT_ENV_FILE'),
                    file(credentialsId: 'pomotask-django-env', variable: 'DJANGO_ENV_FILE'),
                    file(credentialsId: 'pomotask-react-native-env', variable: 'RN_ENV_FILE')
                ]) {
                    sh '''
                        cp "$ROOT_ENV_FILE" .env
                        cp "$DJANGO_ENV_FILE" django/.env
                        cp "$RN_ENV_FILE" react-native/.env
                    '''
                }
            }
        }

        stage('Build & deploy') {
            steps {
                sh 'docker compose up -d --build'
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
            echo "Deployed: Django -> http://<host>:${DJANGO_HOST_PORT}  |  React Native web -> http://<host>:${REACT_NATIVE_HOST_PORT}  |  Mongo data persisted in volume pomotask_mongo_data"
        }
        failure {
            echo 'Pomotask deployment failed. Check the stage logs above.'
        }
    }
}
