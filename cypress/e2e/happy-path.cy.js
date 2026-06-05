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

const testUser = {
  student_id: 42,
  email: "student@example.com",
  password: "securePass123",
  token: "cypress-access-token",
};

const verificationToken = "cypress-email-verification-token";

const quarterIntroCourse = {
  type: "course",
  id: 101,
  code: "CSC 101",
  title: "Fundamentals of Computer Science",
  units: 4,
  completion: "Completed",
};

const quarterDataStructuresCourse = {
  type: "course",
  id: 202,
  code: "CSC 202",
  title: "Data Structures",
  units: 4,
  completion: "Remaining",
};

const semesterIntroCourse = {
  type: "course",
  id: 1001,
  code: "CSC 1001",
  title: "Computer Science Fundamentals",
  units: 3,
  completion: "Completed",
};

const comparisonResponse = {
  quarterRequirements: [
    {
      catalog: 1,
      name: "Introductory Courses",
      completion: "Completed",
      requirement: quarterIntroCourse,
    },
    {
      catalog: 1,
      name: "Core Courses",
      completion: "Remaining",
      requirement: quarterDataStructuresCourse,
    },
  ],
  semesterRequirements: [
    {
      catalog: 2,
      name: "Semester Foundation",
      completion: "Completed",
      requirement: semesterIntroCourse,
    },
  ],
  courseMappings: [
    {
      id: 1,
      substituteCourses: [semesterIntroCourse],
      substitutedOutCourses: [quarterIntroCourse],
    },
  ],
  quarterUnits: 4,
  semesterUnits: 3,
};

function stubApi() {
  cy.intercept("POST", "**/register", (req) => {
    expect(req.body).to.deep.equal({
      email: testUser.email,
      password: testUser.password,
    });

    req.reply({
      statusCode: 201,
      body: {
        student_id: testUser.student_id,
        email: testUser.email,
      },
    });
  }).as("registerUser");

  cy.intercept("GET", "**/verify-email?token=*", (req) => {
    if (req.headers.accept?.includes("text/html")) {
      req.continue();
      return;
    }

    expect(req.query.token).to.eq(verificationToken);
    req.alias = "verifyEmail";
    req.reply({
      statusCode: 200,
      body: {
        message: "Email verified successfully.",
      },
    });
  });

  cy.intercept("POST", "**/login", (req) => {
    expect(req.body).to.deep.equal({
      email: testUser.email,
      password: testUser.password,
    });

    req.reply({
      statusCode: 200,
      body: {
        token: testUser.token,
        student_id: testUser.student_id,
        email: testUser.email,
      },
    });
  }).as("loginUser");

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

  cy.intercept("GET", "**/class-selector/42/courses?*", {
    statusCode: 200,
    body: {
      majorCourses: courses,
    },
  }).as("loadMajorCourses");

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

  it("visits every page and translates selected quarter courses", () => {
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
      cy.get("input[name='email']").type(testUser.email);
      cy.get("input[name='password']").type(testUser.password);
      cy.contains("button", "Sign Up").click();
    });
    cy.wait("@registerUser");
    cy.contains("We sent a verification link").should("be.visible");
    cy.contains(testUser.email).should("be.visible");

    cy.visit(`/verify-email?token=${verificationToken}`);
    cy.location("pathname").should("eq", "/verify-email");
    cy.wait("@verifyEmail");
    cy.contains("Cal Poly Q2S").should("be.visible");

    cy.visit("/login");

    cy.location("pathname").should("eq", "/login");
    cy.get("form").within(() => {
      cy.get("input[name='email']").type(testUser.email);
      cy.get("input[name='password']").type(testUser.password);
      cy.contains("button", "Sign In").click();
    });
    cy.wait("@loginUser");
    cy.location("pathname").should("eq", "/class-selector");

    cy.wait(["@loadCatalog", "@loadSavedCourses"]);

    cy.contains("Search for your Classes").should("be.visible");
    cy.get("input[placeholder='Major...']").type("Computer");
    cy.contains("li", "Computer Science").click();
    cy.wait("@loadMajorCourses");
    cy.get("input[placeholder='Search classes...']").type("Fundamentals");
    cy.contains("button", "CSC 101").click();
    cy.contains("Completed Classes").parent().should("contain", "CSC 101");

    cy.contains("Translate Classes").click();
    cy.wait("@saveCourses");
    cy.location("pathname").should("eq", "/q2s-comparison");
    cy.wait("@loadComparison");

    cy.contains("Quarter Catalog (2022-2026)").should("be.visible");
    cy.contains("Semester Catalog (2026-2028)").should("be.visible");
    cy.contains("Introductory Courses").click();
    cy.contains("CSC 101").click();
    cy.contains("Class Conversion").should("be.visible");
    cy.contains("CSC 1001").should("be.visible");
    cy.get(".fixed.inset-0 button").last().click({ force: true });
    cy.contains("Class Conversion").should("not.exist");

    cy.contains("Go Back").click();
    cy.location("pathname").should("eq", "/class-selector");

    cy.contains("a", "Calpoly Q2S").click();
    cy.location("pathname").should("eq", "/");
    cy.contains(testUser.email.split("@")[0]).should("be.visible");
  });
});
