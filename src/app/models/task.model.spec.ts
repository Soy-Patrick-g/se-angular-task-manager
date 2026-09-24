import { normalizeTask } from "./task.model";

describe("normalizeTask", () => {
  it("maps backend status booleans and strings to the UI task model", () => {
    const backendTask = {
      id: 42,
      title: "Ship sprint review",
      description: "Prepare the summary for the sprint review.",
      priority: "high",
      status: false,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
      order: 1,
    };

    const normalized = normalizeTask(backendTask);

    expect(normalized.status).toBe("todo");
    expect(normalized.done).toBeFalse();
    expect(normalized.priority).toBe("high");
  });

  it("keeps UI status values in sync with done state", () => {
    const uiTask = {
      id: 1,
      title: "Write release notes",
      project: "Product launch",
      priority: "urgent",
      status: "done",
      due: "Tomorrow",
      estimate: "45m",
      description: "Capture release notes for the next launch.",
      done: true,
    };

    const normalized = normalizeTask(uiTask);

    expect(normalized.status).toBe("done");
    expect(normalized.done).toBeTrue();
  });
});
