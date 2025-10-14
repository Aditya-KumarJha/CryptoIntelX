require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => {    
    console.log("Server is running on port " + PORT);
    
    // Auto-start the scheduler in production or when explicitly enabled
    const shouldAutoStart = process.env.AUTO_START_SCHEDULER === 'true' || 
                           process.env.NODE_ENV === 'production' || 
                           process.env.RENDER;
    
    if (shouldAutoStart) {
        try {
            const scheduler = require('./src/services/scheduler');
            scheduler.start();
            console.log('🚀 Auto-scheduler started automatically');
        } catch (error) {
            console.error('❌ Failed to auto-start scheduler:', error.message);
        }
    } else {
        console.log('ℹ️ Auto-scheduler not started (set AUTO_START_SCHEDULER=true to enable)');
    }
});
