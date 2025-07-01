# Also replace Jenkinsfile with consolidated version
cat > Jenkinsfile << 'EOF'
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_NAME = "${env.GIT_URL.replaceFirst(/.*\/([^\/]+)\.git/, '$1').toLowerCase()}"
        SLACK_WEBHOOK = credentials('slack-webhook-url')
        JIRA_CREDENTIALS = credentials('jira-api-credentials')
        GIT_SHORT_COMMIT = "${env.GIT_COMMIT[0..7]}"
    }
    
    parameters {
        choice(
            name: 'DEPLOY_ENVIRONMENT',
            choices: ['none', 'staging', 'production'],
            description: 'Select deployment environment'
        )
        booleanParam(
            name: 'NOTIFY_SLACK',
            defaultValue: true,
            description: 'Send Slack notifications'
        )
    }
    
    stages {
        stage('🧪 Complete Integration Tests') {
            steps {
                script {
                    currentBuild.displayName = "#${env.BUILD_NUMBER} - ${env.GIT_SHORT_COMMIT}"
                }
                
                sh '''
                    echo "🧪 Running complete integration test suite..."
                    npm install
                    
                    # Test all integrations in one script
                    node test-integrations.js
                '''
            }
        }
        
        stage('🔍 Code Quality') {
            steps {
                sh '''
                    echo "🔍 Running code quality checks..."
                    npm audit --audit-level moderate || true
                '''
            }
        }
        
        stage('🏗️ Build & Deploy') {
            when {
                expression { params.DEPLOY_ENVIRONMENT != 'none' }
            }
            steps {
                sh '''
                    echo "🏗️ Building and deploying..."
                    # Add build and deployment commands
                '''
            }
        }
    }
    
    post {
        always {
            script {
                if (params.NOTIFY_SLACK) {
                    def status = currentBuild.currentResult
                    def color = status == 'SUCCESS' ? 'good' : 'danger'
                    def emoji = status == 'SUCCESS' ? '✅' : '❌'
                    
                    slackSend(
                        channel: '#devops-alerts',
                        color: color,
                        message: """
${emoji} *Pipeline ${status}*
*Project:* ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
*Commit:* ${env.GIT_SHORT_COMMIT}
*All integrations tested in single pipeline*
"""
                    )
                }
            }
        }
    }
}
EOF