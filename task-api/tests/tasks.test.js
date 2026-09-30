const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

describe("Tasks API", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should create a new task", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Learn Jest",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Jest");
    expect(response.body.status).toBe("todo");
    expect(response.body.priority).toBe("medium");
    expect(response.body).toHaveProperty("id");
  });

  it("should return 400 when title is missing", async () => {
    const response = await request(app).post("/tasks").send({
      description: "Task without title",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "title is required and must be a non-empty string"
    );
  });

  it("should return 400 when status is invalid", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Invalid status task",
      status: "pending",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "status must be one of: todo, in_progress, done"
    );
  });

  it("should return 400 when dueDate is invalid", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Invalid due date task",
      dueDate: "not-a-date",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "dueDate must be a valid ISO date string"
    );
  });
});

describe("GET /tasks", () => {
  beforeEach(() => {
    taskService._reset();

    taskService.create({
      title: "Learn DSA",
      status: "todo",
    });

    taskService.create({
      title: "Build Project",
      status: "done",
    });
  });

  it("should return all tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Learn DSA");
    expect(response.body[1].title).toBe("Build Project");
  });

  it("should return tasks filtered by status", async () => {
    const response = await request(app)
      .get("/tasks")
      .query({ status: "done" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Build Project");
    expect(response.body[0].status).toBe("done");
  });
});

describe("GET /tasks pagination", () => {
  beforeEach(() => {
    taskService._reset();

    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });
    taskService.create({ title: "Task 3" });
    taskService.create({ title: "Task 4" });
  });

  it("should return the first page of tasks", async () => {
    const response = await request(app).get("/tasks").query({
      page: 1,
      limit: 2,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Task 1");
    expect(response.body[1].title).toBe("Task 2");
  });

  it("should return the second page of tasks", async () => {
    const response = await request(app).get("/tasks").query({
      page: 2,
      limit: 2,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Task 3");
    expect(response.body[1].title).toBe("Task 4");
  });
});

describe("PUT /tasks/:id", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should update an existing task", async () => {
    const task = taskService.create({
      title: "Old Title",
      priority: "low",
    });

    const response = await request(app).put(`/tasks/${task.id}`).send({
      title: "Updated Title",
      priority: "high",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated Title");
    expect(response.body.priority).toBe("high");
    expect(response.body.id).toBe(task.id);
  });

  it("should return 404 when updating a task that does not exist", async () => {
    const response = await request(app).put("/tasks/invalid-id").send({
      title: "Updated Title",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  it("should return 400 when updating with an empty title", async () => {
    const task = taskService.create({
      title: "Original Title",
    });

    const response = await request(app).put(`/tasks/${task.id}`).send({
      title: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("title must be a non-empty string");
  });

  it("should return 400 when updating with an invalid priority", async () => {
    const task = taskService.create({
      title: "Test Task",
    });

    const response = await request(app).put(`/tasks/${task.id}`).send({
      priority: "urgent",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "priority must be one of: low, medium, high"
    );
  });

  it("should return 400 when updating with an invalid dueDate", async () => {
    const task = taskService.create({
      title: "Test Task",
    });

    const response = await request(app).put(`/tasks/${task.id}`).send({
      dueDate: "not-a-date",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "dueDate must be a valid ISO date string"
    );
  });
});

describe("DELETE /tasks/:id", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should delete an existing task", async () => {
    const task = taskService.create({
      title: "Task to delete",
    });

    const response = await request(app).delete(`/tasks/${task.id}`);

    expect(response.statusCode).toBe(204);

    const remainingTask = taskService.findById(task.id);
    expect(remainingTask).toBeUndefined();
  });

  it("should return 404 when deleting a task that does not exist", async () => {
    const response = await request(app).delete("/tasks/invalid-id");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });
});

describe("PATCH /tasks/:id/complete", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should mark an existing task as completed", async () => {
    const task = taskService.create({
      title: "Complete this task",
      status: "in_progress",
      priority: "high",
    });

    const response = await request(app).patch(`/tasks/${task.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.priority).toBe("medium");
    expect(response.body.completedAt).not.toBeNull();
    expect(response.body.id).toBe(task.id);
  });

  it("should return 404 when completing a task that does not exist", async () => {
    const response = await request(app).patch("/tasks/invalid-id/complete");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });
});

describe("GET /tasks/stats", () => {
  beforeEach(() => {
    taskService._reset();

    taskService.create({
      title: "Todo Task",
      status: "todo",
    });

    taskService.create({
      title: "Progress Task",
      status: "in_progress",
    });

    taskService.create({
      title: "Done Task",
      status: "done",
    });
  });

  it("should return task statistics", async () => {
    const response = await request(app).get("/tasks/stats");

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(1);
    expect(response.body.done).toBe(1);
    expect(response.body.overdue).toBe(0);
  });
});

describe("PATCH /tasks/:id/assign", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should assign a task to a user", async () => {
    const task = taskService.create({
      title: "Complete assignment",
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: "Naina",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.assignee).toBe("Naina");
  });

  it("should return 404 when assigning a task that does not exist", async () => {
    const response = await request(app)
      .patch("/tasks/invalid-id/assign")
      .send({
        assignee: "Naina",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  it("should return 400 when assignee is missing", async () => {
    const task = taskService.create({
      title: "Complete assignment",
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "assignee is required and must be a non-empty string"
    );
  });

  it("should return 400 when assignee is an empty string", async () => {
    const task = taskService.create({
      title: "Complete assignment",
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "assignee is required and must be a non-empty string"
    );
  });

  it("should allow reassigning a task to another user", async () => {
    const task = taskService.create({
      title: "Reassign this task",
    });

    await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: "Naina",
      });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: "Rahul",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe("Rahul");
  });
});