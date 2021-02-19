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
            return null;
            }


            [results] = await connection.execute(sql,[created_by,title,description])
            var newCat = new Category(results.insertId,created_by,title,description)
            await newCat.setUser();
            return newCat;

        }
        catch(error){
            console.log(error)
            return null;
        }
        finally{
            await connection.end();
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


        }
        catch(error){
            console.log(error)
            return await null
        }
        finally{
            await connection.end();
        }

        return await retrieved
    }

    static async findByTitle(title){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM category WHERE title = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[title]);
            if(results[0] == null){
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


        }
        catch(error){
            console.log(error)
            return await null
        }
        finally{
            await connection.end();
        }

        return await retrieved
    }

    async delete(){
        const connection = await Model.connect();
        const sql = `update category set deleted_at = NOW() where id = ? ;`;
        let results;

        try{

		    [results] = await connection.execute(sql,[this.id]);
            
            this.setDeletedAt(Date.now());//fix

            return true;
        }
        catch(error){
            console.log(error)
            return false;
        }
        finally{
            await connection.end();
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
            return false;
        }

        try{

		    [results] = await connection.execute(sql,[this.title,this.description,this.id]);
            
            this.setEditedAt(Date.now());

            return true;
        }
        catch(error){
            console.log(error)
            return false;
        }
        finally{
            await connection.end();
        }
    }

}



module.exports = Category;
