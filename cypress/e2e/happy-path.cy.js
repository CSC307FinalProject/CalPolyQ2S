const courses = [
  {
    course_id: 101,
    catalog_id: 1,
    course_code: "CSC 101",
    course_name: "Fundamentals of Computer Science",
    tag: "LOWER DIV",
  },
  {
    course_id: 202,
    catalog_id: 1,
    course_code: "CSC 202",
    course_name: "Data Structures",
    tag: "LOWER DIV",
  },
  {
    course_id: 349,
    catalog_id: 1,
    course_code: "CSC 349",
    course_name: "Algorithms",
    tag: "UPPER DIV",
  },
];

const comparisonResponse = {
  courses: [
    {
      course_id: 101,
      course_code: "CSC 101",
      course_name: "Fundamentals of Computer Science",
      units: 4,
      converted_course_id: 1001,
      converted_course_code: "CSC 1001",
      converted_course_name: "Computer Science Fundamentals",
      converted_units: 3,
    },
  ],
  quarterCourses: [
    {
      course_id: 101,
      course_code: "CSC 101",
      course_name: "Fundamentals of Computer Science",
      units: 4,
    },
    {
      course_id: 202,
      course_code: "CSC 202",
      course_name: "Data Structures",
      units: 4,
    },
  ],
  semesterCourses: [
    {
      course_id: 1001,
      course_code: "CSC 1001",
      course_name: "Computer Science Fundamentals",
      units: 3,
    },
    {
      course_id: 1002,
      course_code: "CSC 1002",
      course_name: "Data Structures and Algorithms",
      units: 3,
    },
  ],
};

function stubApi() {
  cy.intercept("GET", "**/class-selector", (req) => {
    if (req.headers.accept?.includes("text/html")) {
      req.continue();
      return;
    }

    req.alias = "loadCatalog";
    req.reply({
      statusCode: 200,
      body: {
        majors: [
          {
            major_id: 1,
            major_code: "CSC",
            major_name: "Computer Science",
          },
        ],
        courses,
      },
    });
  });

  cy.intercept("GET", "**/class-selector/42", {
    statusCode: 200,
    body: {
      courses: [],
      user: {
        major_name: "",
      },
    },
  }).as("loadSavedCourses");

  cy.intercept("POST", "**/class-selector/42", {
    statusCode: 200,
    body: {
      message: "Courses saved successfully.",
    },
  }).as("saveCourses");

  cy.intercept("GET", "**/q2s-comparison/42", {
    statusCode: 200,
    body: comparisonResponse,
  }).as("loadComparison");
}

describe("Cal Poly Q2S happy path", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => win.sessionStorage.clear());
    stubApi();
  });

  it("visits every main view and translates selected quarter courses", () => {
    cy.visit("/");
    cy.contains("Confused on the Quarter to Semester Change?").should(
      "be.visible",
    );

    cy.contains("a", "Login").click();
    cy.location("pathname").should("eq", "/login");
    cy.get("form").should("be.visible");

    cy.contains("a", "Create Account").click();
    cy.location("pathname").should("eq", "/register");
    cy.get("form").within(() => {
      cy.get("input[name='email']").type("student@example.com");
      cy.get("input[name='password']").type("securePass123");
    });

    cy.window().then((win) => {
      win.sessionStorage.setItem(
        "user",
        JSON.stringify({
          student_id: 42,
          email: "student@example.com",
        }),
      );
    });
    cy.visit("/");
    cy.contains("Get Started").click();

    cy.wait(["@loadCatalog", "@loadSavedCourses"]);

    cy.contains("Search for your catalog").should("be.visible");
    cy.get("input[placeholder='Major...']").type("Computer");
    cy.contains("li", "Computer Science").click();
    cy.get("input[placeholder='Search classes...']").type("Fundamentals");
    cy.contains("button", "CSC 101").click();
    cy.contains("Completed Classes").parent().should("contain", "CSC 101");

    cy.contains("Translate Classes").click();
    cy.wait("@saveCourses");
    cy.location("pathname").should("eq", "/q2s-comparison");
    cy.wait("@loadComparison");

    cy.contains("Quarter Catalog (2022-2026)").should("be.visible");
    cy.contains("Semester Catalog (2026-2030)").should("be.visible");
    cy.contains("button", "CSC 101").click();
    cy.contains("Class Conversion").should("be.visible");
    cy.contains("CSC 1001").should("be.visible");
    cy.get(".fixed.inset-0 button").last().click({ force: true });
    cy.contains("Class Conversion").should("not.exist");

    cy.contains("Go Back").click();
    cy.location("pathname").should("eq", "/class-selector");
  });
});
