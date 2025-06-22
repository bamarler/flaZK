window.DEMO_CONFIG = {
    API_URL: 'http://localhost:3001/api/verification',
    API_KEY: 'test-api-key-123',
    WIDGET_URL: 'http://localhost:8081',
    CLIENT_ID: 'acme-car-rental',
    CALLBACK_URL: window.location.origin + '/callback',
    REQUIREMENTS: {
        age_min: 25,
        license_status: 1,
        points_max: 6
    }
};