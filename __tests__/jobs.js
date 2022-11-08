const supertest = require('supertest');

const app = require('../src/app');

describe('/jobs API', () => {
    
    describe('GET /jobs/unpaid', () => {
        test("no auth", async () => {
            await supertest(app)
              .get('/jobs/unpaid')
              .expect(401)
        })
    
        test("not found", async () => {
            await supertest(app)
            .get('/jobs/unpaid')
              .set('profile_id', '3')
              .expect(404)
        })

        test("ok client", async () => {
          await supertest(app)
          .get('/jobs/unpaid')
            .set('profile_id', '1')
            .expect('Content-Type', /json/)
            .expect(200)
        })

        test("ok contractor", async () => {
          await supertest(app)
          .get('/jobs/unpaid')
            .set('profile_id', '6')
            .expect('Content-Type', /json/)
            .expect(200)
        })
    
        
    })

    describe('POST /jobs/:job_id/pay', () => {
        test("no auth", async () => {
            await supertest(app)
              .post('/jobs/2/pay')
              .expect(401)
        })
    
        test("wrong user type", async () => {
            await supertest(app)
              .post('/jobs/2/pay')
              .set('profile_id', '6')
              .expect(403)
        })

        test("wrong user type", async () => {
          await supertest(app)
            .post('/jobs/200/pay')
            .set('profile_id', '1')
            .expect(404)
        })

        test("already paid", async () => {
          await supertest(app)
            .post('/jobs/14/pay')
            .set('profile_id', '2')
            .expect(403)
        })

        test("wrong owner", async () => {
          await supertest(app)
            .post('/jobs/1/pay')
            .set('profile_id', '2')
            .expect(403)
        })
    
        test("ok", async () => {
           await supertest(app)
            .post('/jobs/2/pay')
            .set('profile_id', '1')
            .expect(200)
        })
    
    })

})
