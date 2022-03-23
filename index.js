const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const {
    connect,
    getDB
} = require('./MongoUtil');

// console.log(process.env.MONGO_URI)

// Express
const app = express();

// enable JSON data processing
app.use(express.json());

// enable CORS 
app.use(cors());


// Routes
async function main(){
    // connect to mongodb
    await connect(process.env.MONGO_URI, "diy_home_decor")

    // Read 
    app.get('/diy_project', async function (req, res) {

        try { 
            let criteria = {};

            if (req.query.project_title) {
                criteria['project_title'] = {
                    '$regex': req.query.project_title,
                    '$options': 'i'
                }
            }

            if (req.query.description) {
                criteria['description'] = {
                    '$regex': req.query.description,
                    '$options': 'i'
                }
            }

            if (req.query.tags) {
                criteria['tags'] = {
                    '$in': [req.query.tags]
                }
            }

            if (req.query.supplies) {
                criteria['supplies'] = {
                    '$in': [req.query.supplies]
                }
            }

            if (req.query.craft_type) {
                criteria['craft_type'] = {
                    '$in': [req.query.craft_type]
                }
            }

            if (req.query.category) {
                criteria['category'] = {
                    '$in': [req.query.category]
                }
            }

            console.log(criteria);

            const db = getDB();
            let results = await db.collection('projects')
                .find(criteria, {
                    'projection': {
                        'project_title': 1,
                        'user_name': 1,
                        'date_of_post': 1,
                        'photo': 1
                    }
                })
                .toArray();
            res.json({
                'results': results
            })

        } catch (e) {
            res.status(500);
            res.send({
                'error': "error"
            })
        }
    })

    // create post
    app.post('/diy_project', async function (req, res) {

        try {
            let project_title = req.body.project_title;
            let user_name = req.body.user_name;
            let date_of_post = new Date(req.body.date_of_post);
            let photo = req.body.photo;
            let description = req.body.description;
            let tags = req.body.tags.split(',');
            let supplies = req.body.supplies.split(',');
            let craft_type = req.body.craft_type;
            let category = req.body.category;
            let time_required = req.body.time_required;
            let difficulty = req.body.difficulty;
            let instructions = req.body.instructions;

            const db = getDB();
            db.collection('projects').insertOne({
                project_title, user_name, date_of_post, photo, description, tags, supplies, craft_type, category, time_required, difficulty, instructions
            });
            res.status(200);
            res.json({
                'message': 'added'
            });
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'internal server error. Please contact administrator'
            })
            console.log(e)
        }
        
    })

    // update post
    app.put('/diy_project/:id', async function (req,res) {

        try {
            // let project_title = req.body.project_title;
            // let user_name = req.body.user_name;
            // let date_of_post = req.body.date_of_post;
            // let photo = req.body.photo;
            // let description = req.body.description;
            // let tags = req.body.tags;
            // let supplies = req.body.supplies;
            // let craft_type = req.body.craft_type;
            // let category = req.body.category;
            // let time_required = req.body.time_required;
            // let difficulty = req.body.difficulty;
            // let instructions = req.body.instructions;

            let { project_title, user_name,
                date_of_post, photo, description,
                tags, supplies, craft_type, category,
                time_required, difficulty, instructions } = req.body;

            date_of_post = new Date(date_of_post);
            tags = tags.split(',');
            supplies = supplies.split(',');
            craft_type = craft_type.split(',');
            category = category.split(',');

            let results = await getDB().collection('projects').updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$set': {
                    project_title, user_name, date_of_post, photo, description, tags, supplies, craft_type, category, time_required, difficulty, instructions
                }
            })
            res.status(200);
            res.json({
                'message': 'updated'
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'internal server error. Please contact administrator'
            });
            console.log(e);
        }

        

    })

    // delete post
    app.delete('/diy_project/:id', async function (req, res) {
        await getDB().collection('projects').deleteOne({
            '_id': ObjectId(req.params.id)
        })
        res.status(200);
        res.json({
            'message':'deleted'
        })
    })

}
main();

// Listen
app.listen(3000, function(){
    console.log("Server has started")
})