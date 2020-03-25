const crypto = require('crypto');
const connection = require('../database/connection')

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query; 
        const size_page = 5;
        const [count] = await connection('incident').count();
        console.log(count);
        
        const incidents = await connection('incident')
            .join('ong', 'ong.id', '=', 'incident.ong_id')
            .limit(size_page)
            .offset((page - 1) * size_page)
            .select([
                'incident.*', 
                'ong.name', 
                'ong.email', 
                'ong.whatsapp', 
                'ong.city', 
                'ong.uf'
            ]);

        res.header('X-Total-Count', count['count(*)']);
        return res.json(incidents);
    },


    async create(req, res) {
        const { title, description, value } = req.body;
        const ong_id = req.headers.authorization;

        const [id] = await connection('incident').insert({
            title, description, value, ong_id
        });


        return res.json({ id })
    },

    async delete(req, res) {
        const { id } = req.params;
        console.log(id)
        const ong_id = req.headers.authorization;

        const incident = await connection('incident')
        .where('id', id)
        .select('ong_id')
        .first();        
        if(incident.ong_id != ong_id){
            return res.status(401).json({error:'Unauthorized'}); 
        }

        await connection('incident').where('id', id).delete();

        return res.status(204).send();
    }

}