const {date} = require("../../lib/data")

const db = require("../../config/db")


module.exports = {
    all(callback){
        db.query(`
            SELECT instructors.name, instructors.services, instructors.avatar_url, count(members) AS total_students
            FROM instructors
            LEFT JOIN members ON members.instructor_id = instructors.id
            GROUP BY instructors.name, instructors.services, instructors.avatar_url
            ORDER BY name ASC`, function(err, results){
            if (err) return res.send('Database ERROR!!!') 
            callback(results.rows)
        })
    },
    create(data, callback){

        const query = `
            INSERT INTO instructors(
                name,
                avatar_url,
                gender,
                services,
                birth,
                created_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id`

        const values = [
            data.name,
            data.avatar_url,
            data.gender,
            data.services,
            date(data.birth).iso,
            date(Date.now()).iso
        ]

        db.query(query, values, function(err, results){

            if(err) throw `Database ERROR! ${err}`
            callback(results.rows[0])

        })

    },
    find(id, callback){
        db.query(`
            SELECT * 
            FROM instructors 
            WHERE id = $1`, [id], function(err, results){
                if(err) throw `Database ERROR! ${err}`
                callback(results.rows[0])
        })
    },
    findBy(filter, callback){
        db.query(`
            SELECT instructors.name, instructors.services, instructors.avatar_url, count(members) AS total_students
            FROM instructors
            LEFT JOIN members ON members.instructor_id = instructors.id
            WHERE instructors.name ILIKE '%${filter}%'
            OR instructors.services ILIKE '%${filter}%'
            GROUP BY instructors.name, instructors.services, instructors.avatar_url
            ORDER BY name ASC`, function(err, results){
            if (err) return res.send('Database ERROR!!!') 
            callback(results.rows)
        })
    },
    update(data, callback){
        const query = `
        UPDATE instructors SET
            avatar_url=($1),
            name=($2),
            birth=($3),
            gender=($4),
            services=($5)
        WHERE id = $6
        `

        const values = [
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.gender,
            data.services,
            data.id
        ]

        db.query(query, values, function(err, results){
            if (err) throw `Database ERROR! ${err}`
            callback()
        })      
    },
    delete(id, callback){
        db.query(`DELETE FROM instructors WHERE id = $1`, [id], function(err, results){
            if (err) throw `Database ERROR! ${err}`

            return callback()
        })
    },
    paginate(params){
       const {filter, limit, offset, callback} = params

       let query = "",
            filterQuery = ""
            totalQuery = ` (
        SELECT count(*) FROM instructors
       )AS total`


       if (filter){
            filterQuery = `
            WHERE instructors.name ILIKE '%${filter}%'
            OR instructors.services ILIKE '%${filter}%'
            `

            totalQuery = `(
                SELECT count(*) FROM instructors
                ${filterQuery}
            ) AS total`
       }

       query = `
        SELECT instructors.name, instructors.services, instructors.avatar_url,${totalQuery}, count(members) AS total_students
        FROM instructors
        LEFT JOIN members ON (instructors.id = members.instructor_id)
        ${filterQuery}
        GROUP BY instructors.name, instructors.services, instructors.avatar_url LIMIT $1 OFFSET $2
        `

        db.query(query, [limit, offset], function(err, results){
            if (err) throw 'Database Error!'

            callback(results.rows)
        })
    }
}