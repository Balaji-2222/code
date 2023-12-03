const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;
const dbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running");
    });
  } catch (e) {
    console.log(`Error is : ${e.message}`);
    process.exit(1);
  }
};
dbServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasOnlyCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const c = (eachOne) => {
  return {
    id: eachOne.id,
    todo: eachOne.todo,
    priority: eachOne.priority,
    status: eachOne.status,
    category: eachOne.category,
    dueDate: eachOne.due_date,
  };
};
app.get("/todo/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}'
    AND status = '${status}'`;
      break;
    case hasCategoryAndPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}'
    AND priority = '${priority}'`;
      break;
    case hasOnlyCategoryProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}'`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(
    data.map((eachOne) => {
      return c(eachOne);
    })
  );
});
//API-2
app.get("/todo/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo
    WHERE id ='${todoId}'`;
  const ans = await db.get(query);
  response.send(c(ans));
});
const toUpdateStatus = (requestBody) => {
  return requestBody.status !== undefined;
};
const toUpdatePriority = (requestBody) => {
  return requestBody.priority !== undefined;
};
const toUpdateTodo = (requestBody) => {
  return requestBody.todo !== undefined;
};
const toUpdateCategory = (requestBody) => {
  return requestBody.category !== undefined;
};
const toUpdateDate = (requestBody) => {
  return requestBody.dueDate !== undefined;
};
//API-5
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  switch (true) {
    case toUpdateStatus(request.body):
      const ans5 = `UPDATE todo SET status = '${status}'
            WHERE id = ${todoId}`;
      const s = await db.run(ans5);
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid todo status");
      }
      break;
    case toUpdatePriority(request.body):
      const ans6 = `UPDATE todo SET priority = '${priority}'
            WHERE id = ${todoId}`;
      await db.run(ans6);
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case toUpdateTodo(request.body):
      const ans7 = `UPDATE todo SET todo = '${todo}'
            WHERE id = ${todoId}`;
      await db.run(ans7);
      response.send("Todo Updated");
      break;
    case toUpdateCategory(request.body):
      const ans8 = `UPDATE todo SET category = '${category}'
            WHERE id = ${todoId}`;
      await db.run(ans8);
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case toUpdateDate(request.body):
      const ans9 = `UPDATE todo SET due_date = '${dueDate}'
            WHERE id = ${todoId}`;
      await db.run(ans9);
      response.send("Due Date Updated");
      break;
  }
});
//LAST-API
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo
    WHERE id = ${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
