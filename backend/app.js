const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/advance', require('./routes/advance.routes'));
app.use('/api/udhar', require('./routes/udhar.routes'));
app.use('/api/expense', require('./routes/expense.routes'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
