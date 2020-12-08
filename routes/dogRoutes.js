module.exports = function (app, pool, passport) {

    /* INSERT INTO stock_availability (product_id, available)
    VALUES
        (100, TRUE), */

    /*dog_id SERIAL PRIMARY KEY,
    breed VARCHAR(256),
    subBreed VARCHAR(256),
    imageUrl VARCHAR(256),
    custom BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()*/

    app.post('/savedog', checkAuthenticated, async (req, res) => {
        try {
            const { breed, possibleSubBreed, imageUrl, possibleCustom } = req.body;
            let subBreed = possibleSubBreed ? possibleSubBreed : null
            let custom = possibleCustom ? possibleCustom : false

            console.log(breed, subBreed, imageUrl, custom)

            // TODO check subbreed

            //TODO if custom then store picture
            const newDog = await pool.query(
                "INSERT INTO dogs (breed, subBreed, imageUrl, custom) VALUES ($1, $2, $3, $4) RETURNING *",
                [breed, subBreed, imageUrl, custom]
            )

            console.log(newDog.rows[0])
            res.json(`dog: '${newDog.rows[0].breed}' inserted`)
        } catch (err) {
            console.log(err.message)
            res.json(`save dog error: ${err.message}`)
        }
    })

    app.get('/getdogs', checkAuthenticated, async (req, res) => {
        try {
            const dogs = await pool.query(
                "SELECT * FROM dogs"
            )
            console.log(`dogs from db is: `)
            console.log(dogs.rows)

            res.json(dogs.rows)
        } catch (err) {
            console.log(err.message)
            res.json(`get dogs error: ${err.message}`)
        }
    })

    app.patch('/updatedog', checkAuthenticated, async (req, res) => {
        try {
            const { dog_id, breed, subBreed } = req.body;

            if (!dog_id) {
                throw { message: "no dog_id provided for updating" }
            }

            if (breed) {
                if (subBreed) {
                    await pool.query(
                        "UPDATE dogs SET breed=$2, subBreed=$3 WHERE dog_id=$1",
                        [dog_id, breed, subBreed]
                    )
                } else {
                    await pool.query(
                        "UPDATE dogs SET breed=$2 WHERE dog_id=$1",
                        [dog_id, breed]
                    )
                }
            } else {
                if (subBreed) {
                    await pool.query(
                        "UPDATE dogs SET subBreed=$2 WHERE dog_id=$1",
                        [dog_id, subBreed]
                    )
                } else {
                    throw { message: "no breed or subbreed provided" }
                }
            }

            console.log(`dog updated to ${breed}-${subBreed ? subBreed : ''}`)
            res.json('dog updated')
        }
        catch (err) {
            console.log(err.message)
            res.json(`update dog failure: ${err.message}`)
        }
    })

    app.delete('/deletedog', checkAuthenticated, async (req, res) => {
        try {
            const { dog_id } = req.query;

            if (!dog_id) {
                throw { message: "no dog_id provided for deleting" }
            }

            await pool.query(
                "DELETE FROM dogs WHERE dog_id=$1",
                [dog_id]
            )

            console.log(`deleted dog`)
            res.json(`deleted dog`)
        }
        catch (err) {
            console.log(err.message)
            res.json(`delete dog failure: ${err.message}`)
        }
    })

    app.delete('/deleteselecteddogs', checkAuthenticated, async (req, res) => {
        try {
            const { dogs_ids } = req.body;

            if (!dogs_ids || dogs_ids.length === 0) {
                throw { message: "no dogs_ids provided for deletion" }
            }

            console.log(dogs_ids)

            await pool.query('BEGIN')
            for (index = 0; index < dogs_ids.length; ++index) {
                const queryString = 'DELETE FROM dogs WHERE dog_id=$1';
                console.log(queryString)
                const dog_id = parseInt(dogs_ids[index])
                console.log(`adding dog_id: ${dog_id} for deletion`)
                await pool.query(queryString, [dog_id])
            }
            await pool.query('COMMIT')

            console.log(`deleted selected dogs`)
            res.json(`deleted selected dogs`)
        }
        catch (err) {
            await pool.query('ROLLBACK')
            console.log(err.message)
            res.json(`delete selected dogs failure: ${err.message}`)
        }



    })

    app.delete('/deletedogs', checkAuthenticated, async (req, res) => {
        try {
            await pool.query(
                "DELETE FROM dogs"
            )
            console.log(`deleted all dogs`)
            res.json(`deleted all dogs`)
        }
        catch (err) {
            console.log(err.message)
            res.json(`delete all dogs failure: ${err.message}`)
        }
    })
}

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.json('already authenticated')
    }
    next()
}