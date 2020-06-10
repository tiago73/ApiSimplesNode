const express = require ('express');
const {uuid,isUuid} = require('uuidv4');

SECRET=mysecret
require("dotenv-safe").config();
var jwt = require('jsonwebtoken');

const app = express();


/**
 * Método http
 *  
 * GET: busca informações do back-end
 * POST: Criar uma informação back-end
 * PUT: Alterar uma informação no back-end
 * PATCH: alterar um item especifico
 * DELETE: deletar uma informação no back-end
 * 
 */
/**
 * tipos de parâmetros:
 * 
 * Query Params: Filtros e paginação
 * route Params: Atualizando um recuso
 * Request Body: conteudo na hora criar ou editar um recuso
 */
/**
 * Middleware
 * interceptador de requiseções que interrope 
 * totalmente a requisição ou alterar dados da requisição 
 */

app.use(express.json());

const projects = [];

function logRequest(request,response,next){
    const{method,url} = request;

    const logLabel= `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);
    next();
    console.timeEnd(logLabel);
}

function validateProjectId(request,response,next){
    const {id}= request.params;
    if(!isUuid(id)){
        return response.status(400).json({error:'invaliid project ID.'});
    }
    return next();
}


function verifyJWT(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

app.get('/users', verifyJWT, (req, res, next) => {
    userServiceProxy(req, res, next);
  })

app.post('/login', (req, res, next) => {
    if(req.body.user === 'luiz' && req.body.pwd === '123'){
    
      const id = 1; 
      var token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 300 
      });
      res.status(200).send({ auth: true, token: token });
    }
    
    res.status(500).send('Login inválido!');
  })

app.use(logRequest);
app.use('/projects/:id',validateProjectId);

app.get('/projects',(request, response)=> {
     const{tittle} = request.query;

     const results = tittle ? projects.filter(project => project.tittle.includes(tittle)):projects;

    return response.json(results);
});




app.post('/projects',(request,response)=>{
    const {tittle, owner} = request.body;

    const project = {id:uuid(),tittle, owner};

    projects.push(project);

    return response.json(project);
});

app.put('/projects/:id',(request,response)=>{
    const {id} = request.params;
    const {tittle, owner} = request.body;
    
    const projectIndex = projects.findIndex(project=> project.id === id);

    if(projectIndex < 0){
        return response.status(400).json({error:'project not fount'}); 
    }
    const project ={
        id,
        tittle,
        owner
    };
    
    projects[projectIndex] = project;

    return response.json(project);
})

app.delete('/projects/:id',(request,response)=>{
    const {id} = request.params;
    const projectIndex = projects.findIndex(project=> project.id === id);

    if(projectIndex < 0){
        return response.status(400).json({error:'project not fount'}); 
    }

    projects.splice(projectIndex,1);
    return response.status(204).send();
})

app.listen(3333,()=>{
    console.log("❤ server on");
});