## Code Structure

I implemented a new convenient code structure.  

I organized the code in 4 layers:
- routes
- auth
- validators
- controllers

In the routes folder you can find all routes grouped by entities. Here all APIs are defined and for each route there's a list of middleware used.
Most of the routes use the authentication middleware (implemented by you), the validator middleware and the controller middleware.

The validation layer is made with [express-validator](https://express-validator.github.io/docs/). It just check all params (user input) are in the correct type/form before passing to the next layer. If something is wrong, 422 status code plus the error description is sent back to the client.

The controller layer implements the application logic plus the data access. Inside controllers there is some application logic condition controls that can throw 404 or 403 errors (the first is used when entity are not found, the second when the user can't perform the operation requested, for example because it's not the owner of the resource).


This is the best I can do in 3 hours. Generally I prefer working with 6 layers:

- routes
- auth
- validators
- controllers
- services
- data layer

For this test I just implemented the controllers; service layer and data layer is made inside controllers. Generally, I use controllers just to implement HTTP communication;
a controller can access to the express req and res object and to the next express function. His responsability is to read params from request object, pass params to the service layer function, wait for the service to return something and, based on the return value, send back to the client a response with the proper status code.

The service layer implements the application logic. If data access is needed by the service layer, it calls methods from the data layer. Generally, I never call the database driver methods inside services but I always call my data layer methods that abstract the database driver implementation.

This make the data access more reusable and testable.

I think the code structure descrived above is testable and maintainable. Every piece of code has his responsability.  
Again, for time issues, I implemented the service and data layer inside the controller layer for this home task.


## Sequelize vs query builders vs drivers

I spent most of the time to build the query for the admin routes. They were relatively more complex than the other queries. I think using an ORM (sequelize) could slow down the process of writing complex and well optimized SQL queries because of his syntax abstraction. I think I get the required joined and grouped data, but I'm sure that Sequelize compiled query can be optimized.
You can write raw SQL with sequelize if you need it, but if you start writing most of your complex queries with the raw function, using an ORM is almost useless.  
For my personal and working projects, I'm using [knex](https://knexjs.org/), a simple query builder that uses a syntax very near to SQL (but I still use raw SQL for very complex SQL procedures). I think an ORM can simplify simple stuffs, but it will complicate stuff that is already complex by default. Just my opinion. Anyway, I used Sequelize as requested.

## Transactions

I used Transactions in ```/jobs/:job_id/pay``` and ```/balances/deposit/:userId``` APIs.  

Reading the sqlite documentation, it looks that [the default isolation level for transactions is SERIALIZABLE](https://www.sqlite.org/isolation.html). 

Concurrent request can be done to the service (or a cluster of the service). If while performing a query (or a transaction) a resource is used by another active transaction, sqlite will respond with a [SQLITE_BUSY](https://www.sqlite.org/rescode.html#busy) error.  Sequelize will try again to perform the query for 5 times, before sending the error back to the caller (in this case the controller) and a generic 500 error is sent to the client. Why? Because if you implement a retry logic on top of Sequelize, it could happen to have a race condition and a deadlock with two concurrent transaction blocking each other forever. With a database designed for concurrency like PostgreSQL, you can have more control on this and implement a better retry logic, when needed.  
Anyway, concurrency and consistency is correctly implemented.

## The deposit API

I'm pretty sure I didn't get the requirements for the ```/balances/deposit/:userId``` API.  
From your readme file: Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment).  

So, a client can deposit money in another client account? He can deposit money only in his personal account? If the first is true, than it looks strange to me: why two different clients can exchange moneys?... If the second is true, than why the userId param is needed? I can deposit on my own account and using the auth header to know who am I (considering the auth header is a token). And also, "more than 25% of total jobs to pay": so if a client have to pay 100, he can deposit no more than 25? Or no more than 125? And also, is the limit on the current deposit amount or in the total balance of the client?  

As you can see, I have lot's of questions. I did an implementation and I will clarify the requirements that I implemented, knowing that maybe I didn't get the requirements correctly:
I implemented the method so that:
- Only a client can call it
- The caller can deposit on it's own account balance (so profile_id in the auth header should match the userId param)
- If the sum of unpaid jobs balance is 100, you can deposit at most 25 in a single deposit
- You can still do an infinite number of deposits with of 25 (when unpaid jobs balance is 100)

I know it doesn't make sense but any possible interpretation I gave to the description was not totally sensible anyway.  
So at least I declared my interpretation of the requirement.

## Tests and Testability
For time reasons (I tried to stay in 3 hours, maybe more to be honest) I have not done a great job on testing. I implemented some e2e tests for ```jobs``` and ```contracts``` APIs. No unit test were implemented. To run tests: ```npm run test```. Warning: before tests, seed ```npm run seed``` is automatically executed. After tests, a couple of rows are modified.
### e2e
End-to-end test I implemented are very basic. I tested:
- response codes
- auth errors
- ownership errors
- logical errors
- success response  

I did not tested
- response values
- flow execution (like updating a resource and then getting it again to verify if values are changed)

### Unit tests
The code structure I used makes the code more testable than with the original but we can do surely better. Like I wrote on the first chapter, in general I split the code more than what I did here, to make it totally testable. Mocking sequelize can be tedious. With a data_layer that abstracts the sequelize calls, you can mock the database access easily and you can also change the ORM/Driver library fast without the need to change your application logic too.

## Dependencies
After running ```npm i```, you will find that 10 vulerabilities (or more) are detected. I have not updated dependencies to avoid any possible breaking change, again, for time reasons.