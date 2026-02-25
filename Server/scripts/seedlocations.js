const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Location = require('../models/location'); // Adjust the path as per your project structure




const filePath = path.join(__dirname, '../data/india_locations.csv');

const seedLocations = async () => {
    const locations = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            locations.push({
                name: row.name, // Adjust the column names based on your CSV file
                state: row.state,
                country: row.country,
            });
        })
        .on('end', async () => {
            try {
                await Location.insertMany(locations);
                console.log('Locations seeded successfully');
                mongoose.connection.close();
            } catch (error) {
                console.error('Error seeding locations:', error);
                mongoose.connection.close();
            }
        });
};

seedLocations();