const supertest = require('supertest');

const app = require('../src/app');

describe('/contracts API', () => {
    
    describe('GET /contracts/:id', () => {
        test("no auth", async () => {
            await supertest(app)
              .get('/contracts/1')
              .expect(401)
        })
    
        test("wrong :id 1", async () => {
            await supertest(app)
              .get('/contracts/abc')
              .set('profile_id', '1')
              .expect('Content-Type', /json/)
              .expect(422)
        })
    
        test("wrong :id 2", async () => {
            await supertest(app)
              .get('/contracts/1a')
              .set('profile_id', '1')
              .expect('Content-Type', /json/)
              .expect(422)
        })
    
        test("not found", async () => {
            await supertest(app)
              .get('/contracts/1000')
              .set('profile_id', '1')
              .expect(404)
        })
    
        test("not owner", async () => {
            await supertest(app)
              .get('/contracts/5')
              .set('profile_id', '1')
              .expect(403)
        })
    
        test("ok", async () => {
            await supertest(app)
              .get('/contracts/1')
              .set('profile_id', '1')
              .expect('Content-Type', /json/)
              .expect(200)
    
            
        })
    })

    describe('GET /contracts', () => {
        test("no auth", async () => {
            await supertest(app)
              .get('/contracts')
              .expect(401)
        })
    
        test("not found", async () => {
            await supertest(app)
              .get('/contracts')
              .set('profile_id', '5')
              .expect(404)
        })

        test("ok contractor", async () => {
            await supertest(app)
              .get('/contracts')
              .set('profile_id', '8')
              .expect(200)
              .expect('Content-Type', /json/)
        })
        
        test("ok client", async () => {
            await supertest(app)
              .get('/contracts')
              .set('profile_id', '1')
              .expect(200)
              .expect('Content-Type', /json/)
        })
    })
})
