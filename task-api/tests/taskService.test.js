const taskService = require("../src/services/taskService");

describe("Task Service - create", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should create a new task with default values", () => {
    const task = taskService.create({
      title: "Learn DSA",
    });

    expect(task).toHaveProperty("id");
    expect(task.title).toBe("Learn DSA");
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("medium");
    expect(task.completedAt).toBeNull();
    expect(task).toHaveProperty("createdAt");
  });
});

describe("Task Service - pagination", () => {
  beforeEach(() => {
    taskService._reset();

    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });
    taskService.create({ title: "Task 3" });
    taskService.create({ title: "Task 4" });
  });

  it("should return the first page of tasks", () => {
    const tasks = taskService.getPaginated(1, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("Task 1");
    expect(tasks[1].title).toBe("Task 2");
  });

  it("should return the second page of tasks", () => {
    const tasks = taskService.getPaginated(2, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("Task 3");
    expect(tasks[1].title).toBe("Task 4");
  });
});

describe("Task Service - status filtering", () => {
  beforeEach(() => {
    taskService._reset();

    taskService.create({
      title: "Learn DSA",
      status: "todo",
    });

    taskService.create({
      title: "Build Project",
      status: "in_progress",
    });

    taskService.create({
      title: "Finish Assignment",
      status: "done",
    });
  });

  it("should return only tasks with the requested status", () => {
    const tasks = taskService.getByStatus("todo");

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Learn DSA");
    expect(tasks[0].status).toBe("todo");
  });

  it("should not return tasks when the status does not exactly match", () => {
    const tasks = taskService.getByStatus("progress");

    expect(tasks).toHaveLength(0);
  });
});

describe("Task Service - update", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should update an existing task", () => {
    const task = taskService.create({
      title: "Learn DSA",
      priority: "low",
    });

    const updatedTask = taskService.update(task.id, {
      title: "Learn Advanced DSA",
      priority: "high",
    });

    expect(updatedTask.title).toBe("Learn Advanced DSA");
    expect(updatedTask.priority).toBe("high");
    expect(updatedTask.id).toBe(task.id);
  });

  it("should return null when updating a task that does not exist", () => {
    const updatedTask = taskService.update("invalid-id", {
      title: "Updated Task",
    });

    expect(updatedTask).toBeNull();
  });
});

describe("Task Service - delete", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should delete an existing task", () => {
    const task = taskService.create({
      title: "Delete this task",
    });

    const deleted = taskService.remove(task.id);

    expect(deleted).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  it("should return false when deleting a task that does not exist", () => {
    const deleted = taskService.remove("invalid-id");

    expect(deleted).toBe(false);
  });
});

describe("Task Service - complete task", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should mark an existing task as completed", () => {
    const task = taskService.create({
      title: "Finish assignment",
      status: "in_progress",
      priority: "high",
    });

    const completedTask = taskService.completeTask(task.id);

    expect(completedTask.status).toBe("done");
    expect(completedTask.completedAt).not.toBeNull();
    expect(completedTask.priority).toBe("medium");
    expect(completedTask.id).toBe(task.id);
  });

  it("should return null when completing a task that does not exist", () => {
    const completedTask = taskService.completeTask("invalid-id");

    expect(completedTask).toBeNull();
  });
});

describe("Task Service - stats", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should return correct task counts by status", () => {
    taskService.create({
      title: "Task 1",
      status: "todo",
    });

    taskService.create({
      title: "Task 2",
      status: "in_progress",
    });

    taskService.create({
      title: "Task 3",
      status: "done",
    });

    taskService.create({
      title: "Task 4",
      status: "todo",
    });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(2);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
    expect(stats.overdue).toBe(0);
  });

  it("should count an unfinished overdue task", () => {
    taskService.create({
      title: "Overdue Task",
      status: "todo",
      dueDate: "2020-01-01T00:00:00.000Z",
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(1);
  });
});

describe("Task Service - assign task", () => {
  beforeEach(() => {
    taskService._reset();
  });

  it("should assign a task to a user", () => {
    const task = taskService.create({
      title: "Complete assignment",
    });

    const assignedTask = taskService.assignTask(task.id, "Naina");

    expect(assignedTask.id).toBe(task.id);
    expect(assignedTask.assignee).toBe("Naina");
  });

  it("should return null when assigning a task that does not exist", () => {
    const assignedTask = taskService.assignTask("invalid-id", "Naina");

    expect(assignedTask).toBeNull();
  });

  it("should allow reassigning a task to another user", () => {
    const task = taskService.create({
      title: "Reassign this task",
    });

    taskService.assignTask(task.id, "Naina");

    const reassignedTask = taskService.assignTask(task.id, "Rahul");

    expect(reassignedTask.assignee).toBe("Rahul");
    expect(reassignedTask.id).toBe(task.id);
  });
});