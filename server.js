// import {v4 as uuid4} from 'uuid';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
const apiUrl = "http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639";

const rules = [
    {
        id: 1,
        name: "Valuation Fee Paid",
        condition: (data) => data.isValuationFeePaid === true,
    },
    {
        id: 2,
        name: "UK Resident",
        condition: (data) => data.isUkResident === true,
    },
    {
        id: 3,
        name: "Risk Rating Medium",
        condition: (data) => data.riskRating === "Medium",
    },
    {
        id: 4,
        name: "LTV Below 60%",
        condition: (data) => {
          const ltv = (data.loanRequired / data.purchasePrice) * 100;
          return ltv < 60;
        },
    }
    
]

const evaluateRules = (data) => {
    return rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      status: rule.condition(data) ? "Passed" : "Failed",
    }));
};

app.get("/api/checklist", async (request, res) => {
    try {
        const responseVal = await axios.get(apiUrl);
        const responseData = await responseVal.data;
        const results = evaluateRules(responseData);
        res.json(results);
    }catch(e) {
        console.log(`error: ${e.message}`);
    }
})

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});

module.exports = app;
