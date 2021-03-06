const { promises } = require('fs');
const Model = require('./Model');
const User = require('./User');

class Category extends Model {
    /**
	 * Creates a new Pokemon.
	 * @param {string} description
	 * @param {string} title
	 * @param {number} created_by
     * @param {number} id
     * 
	 */
	constructor(id,created_by,title,description) {
        super(id)
        this.created_by = created_by;
        this.title = title;
        this.description = description;
        this.user = null;

	}

    static async create(created_by,title,description){
        const connection = await Model.connect();   
        const sql = `INSERT INTO category( user_id, title, description, created_at) VALUES (?, ?, ?, NOW());`

        try{
            
            let results;        
            if(title.length == 0){
                await connection.end();
                return null;
            }


            [results] = await connection.execute(sql,[created_by,title,description])
            var newCat = new Category(results.insertId,created_by,title,description)
            await newCat.setUser();

            await connection.end();
            return newCat;

        }
        catch(error){
            console.log(error)
            await connection.end();
            return null;
        }

    }

    getTitle(){
        return this.title;
    }

    getDescription(){
        return this.description;
    }

    async setUser(){        
        this.user = await User.findById(this.created_by);
    }

    getUser(){
        return this.user;
    }

    static async findById(id){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM category WHERE id = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[id]);
            if(results[0] == null){
                await connection.end();
                return await null
            }

            var retrieved = new Category(results[0].id,results[0].user_id,results[0].title,results[0].description)           
            retrieved.setCreatedAt( new Date(results[0].create_at))
          
            if(results[0].edited_at != null){
               retrieved.setEditedAt( new Date(results[0].edited_at)) 
            }

            if(results[0].deleted_at != null){
                retrieved.setDeletedAt( new Date(results[0].deleted_at)) 
            }

            await connection.end();
            return await retrieved

        }
        catch(error){
            console.log(error)
            await connection.end();
            return await null
        }

        
    }

    static async findByTitle(title){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM category WHERE title = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[title]);
            if(results[0] == null){
                await connection.end();
                return await null
            }

            var retrieved = new Category(results[0].id,results[0].user_id,results[0].title,results[0].description)           
            retrieved.setCreatedAt( new Date(results[0].create_at))
          
            if(results[0].edited_at != null){
               retrieved.setEditedAt( new Date(results[0].edited_at)) 
            }

            if(results[0].deleted_at != null){
                retrieved.setDeletedAt( new Date(results[0].deleted_at)) 
            }

            await connection.end();
            return await retrieved

        }
        catch(error){
            console.log(error)
            await connection.end();
            return await null
        }

        
    }

    async delete(){
        const connection = await Model.connect();
        const sql = `update category set deleted_at = NOW() where id = ? ;`;
        let results;

        try{

		    [results] = await connection.execute(sql,[this.id]);
            
            this.setDeletedAt(Date.now());//fix
            await connection.end();
            return true;
        }
        catch(error){
            console.log(error)
            await connection.end();
            return false;
        }

    
    }

    setTitle(newtitle){
        this.title = newtitle;
    }

    async save(){        
        const connection = await Model.connect();
        const sql = `update category set title = ?, description = ?, edited_at = NOW() where id = ? ;`;
        let results;

        if( this.title == 0 ){
            await connection.end();
            return false;
        }

        try{

		    [results] = await connection.execute(sql,[this.title,this.description,this.id]);
            
            this.setEditedAt(Date.now());
            await connection.end();
            return true;
        }
        catch(error){
            console.log(error)
            await connection.end();
            return false;
        }

    }

}



module.exports = Category;
