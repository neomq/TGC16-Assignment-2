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

    // get all projects
    app.get('/projects', async function (req, res) {
        try {
            const db = getDB();
            let projects = await db.collection('projects').find().toArray();

            res.status(200);
            res.send(projects);
        } catch (e) {
            res.status(500);
            res.send({
                'error': "error"
            })
        }
    })

    // get projects by search
    app.get('/projects/search', async function (req, res) {

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

    // post new project
    app.post('/projects', async function (req, res) {

        try {
            let project_title = req.body.project_title;
            let user_name = req.body.user_name;
            // let date_of_post = new Date(req.body.date_of_post);
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
                project_title,
                user_name,
                date_of_post: new Date(),
                photo,
                description,
                tags,
                supplies,
                craft_type,
                category,
                time_required,
                difficulty,
                instructions
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

    // update project
    app.put('/projects/:id', async function (req,res) {

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
            
            const db = getDB();
            let results = await db.collection('projects').updateOne({
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

    // delete project
    app.delete('/projects/:id', async function (req, res) {

        try {
            const db = getDB();
            await db.collection('projects').deleteOne({
                '_id': ObjectId(req.params.id)
            })
            res.status(200);
            res.json({
                'message': 'deleted'
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'unable to delete project'
            })
        }
        
    })

    // -- comments -- //
    // get all comments for each project
    app.get('/projects/:id/comments', async function (req, res) {

        try {
            const db = getDB();
            let results = await db.collection('projects').find({
                "_id": ObjectId(req.params.id)
            }).project({
                'comments': 1
            }).toArray()

            res.status(200);
            res.send(results)

        } catch (e) {
            res.status(500);
            res.json({
                "message": "unable to display comments"
            })
        }
    })

    // post comment
    app.post('/projects/:id/comments', async function (req, res) {

        try {
            const db = getDB();
            let comment_name = req.body.comment_name;
            let comment_text = req.body.comment_text;
            
            let results = await db.collection('projects').updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$push': {
                    'comments': {
                        comment_name,
                        comment_date: new Date(),
                        comment_text
                    }
                }
            })
            res.status(200);
            res.send(results)

        } catch (e) {
            res.status(500);
            res.json({
                "message": "unable to insert comment"
            });
            console.log(e)
        }
    })

    // update comment
    app.put('/projects/:id/comments/:comment_name', async function (req, res) {

        try {
            const db = getDB();
            let { comment_name, comment_text } = req.body

            let results = await db.collection('projects').updateOne({
                'comments': {
                    '$elemMatch': {
                        'comment_name': req.params.comment_name
                    }
                }
            }, {
                '$set': {
                    'comments.$.comment_date': new Date(),
                    'comments.$.comment_name': comment_name,
                    'comments.$.comment_text': comment_text
                }
            })
            res.status(200);
            res.json({
                'message': 'comments updated'
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'unable to update comment'
            });
            console.log(e)
        }
    })

    // delete comment
    app.delete('/projects/:id/comments/:comment_name', async function (req, res) {

        try {
            const db = getDB();
            let project = await db.collection('projects').findOne({
                '_id': ObjectId(req.params.id)
            })

            if (project) {
                let clone = []
                if (project.comments.length > 1) {
                    console.log(project.comments)
                    let oldComment = project.comments;
                    let indexToDelete = oldComment.findIndex((s) => {
                        return s.comment_name == req.params.comment_name;
                    });

                    clone = [
                        ...oldComment.slice(0, indexToDelete),
                        ...oldComment.slice(indexToDelete + 1)
                    ];
                }
                await db.collection('projects').updateOne({
                    '_id': ObjectId(req.params.id)
                }, {
                    $set: {
                        "comments": clone
                    }
                })
                res.status(200)
                res.json({
                    'message': 'deleted'
                });
            }
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'unable to delete comment'
            });
            console.log(e)
        }
    })

}
main();

// Listen
app.listen(3000, function(){
    console.log("Server has started")
})