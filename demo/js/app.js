(function() {
    'use strict';

    const config = window.DEMO_CONFIG;
    let statusElement;
    let verifyButton;

    function updateStatus(type, message) {
        statusElement.className = `status ${type}`;
        statusElement.innerHTML = message;
        statusElement.style.display = 'block';
    }

    function validateProof(proof) {
        return proof && proof.length > 10 && proof.startsWith('0x');
    }

    async function createVerificationRequest() {
        const requestBody = {
            client_id: config.CLIENT_ID,
            callback_url: config.CALLBACK_URL,
            requirements: config.REQUIREMENTS
        };

        console.log('Request URL:', `${config.API_URL}/request`);
        console.log('Request body:', requestBody);

        const response = await fetch(`${config.API_URL}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        return data;
    }

    async function verifyWithFlaZK() {
        verifyButton.disabled = true;
        updateStatus('loading', '<strong>🔄 Processing...</strong><br>Creating verification session.');

        try {
            const data = await createVerificationRequest();

            if (!data.widgetUrl) {
                throw new Error('No widget URL received from server');
            }

            console.log('Opening widget in new tab:', data.widgetUrl);
            window.open(data.widgetUrl, '_blank', 'width=600,height=800');
            
            updateStatus('pending', '<strong>⏳ Verification In Progress</strong><br>Please complete the verification in the new window.');
            verifyButton.disabled = false;
            
            // Store session for testing
            window.currentSession = data.sessionId;
            
            // Listen for completion from widget
            window.handleVerificationComplete = function(result) {
                console.log('Verification completed:', result);
                
                if (result.success && result.proof) {
                    const isValid = validateProof(result.proof);
                    
                    if (isValid) {
                        updateStatus('success', '<strong>✅ Verification Complete</strong><br>You are eligible to rent a vehicle.<br><small>Proof: ' + result.proof.substring(0, 10) + '...</small>');
                    } else {
                        updateStatus('error', '<strong>❌ Verification Error</strong><br>Invalid proof received.');
                    }
                } else {
                    updateStatus('error', '<strong>❌ Requirements Not Met</strong><br>You do not meet the rental requirements.');
                }
            };

        } catch (error) {
            console.error('Verification error:', error);
            updateStatus('error', `<strong>❌ Error</strong><br>${error.message}`);
            verifyButton.disabled = false;
        }
    }

    function init() {
        statusElement = document.getElementById('status');
        verifyButton = document.getElementById('verify-btn');

        if (!statusElement || !verifyButton) {
            console.error('Required elements not found');
            return;
        }

        verifyButton.addEventListener('click', verifyWithFlaZK);
        
        // Listen for postMessage from widget (cross-origin fallback)
        window.addEventListener('message', function(event) {
            console.log('Received message from:', event.origin);
            console.log('Message data:', event.data);
            
            // Verify it's from our widget
            if (event.origin !== 'http://localhost:8081') {
                console.log('Ignoring message from unknown origin:', event.origin);
                return;
            }
            
            if (event.data && event.data.type === 'verification-complete') {
                console.log('Handling verification complete via postMessage');
                if (window.handleVerificationComplete) {
                    window.handleVerificationComplete({
                        sessionId: event.data.sessionId,
                        success: event.data.success,
                        proof: event.data.proof
                    });
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Test function for manual completion
    window.testComplete = async function(success = true) {
        if (!window.currentSession) {
            console.error('No session to complete');
            return;
        }
        
        console.log('Testing completion for session:', window.currentSession);
        
        try {
            const response = await fetch(`${config.API_URL}/complete/${window.currentSession}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: success,
                    proof: success ? '0x' + 'a'.repeat(64) : null
                })
            });
            
            const data = await response.json();
            console.log('Completion response:', data);
            
            if (data.redirectUrl) {
                console.log('Would redirect to:', data.redirectUrl);
            }
        } catch (error) {
            console.error('Completion error:', error);
        }
    };
})();