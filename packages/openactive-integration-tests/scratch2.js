it("should return a female user", function() {
  return expect(apiResponse).to.have.json("results[0].user.gender", "female");
});

it("should return content type and server headers", function() {
  expect(apiResponse).to.have.header("server");
  expect(apiResponse).to.have.header("content-type", /text/);
  return chakram.wait();
});

var namedDweetPost, initialDweetData, specifiedThingName;

before("Initialize a new dweet thing for the tests", function() {
  specifiedThingName = "chakram-test-thing";
  initialDweetData = {
    description: "test sending a string",
    sensorValue: 0.2222,
    alert: true
  };
  namedDweetPost = chakram.post(
    "https://localhost:44307/api/openbooking/" + specifiedThingName,
    initialDweetData
  );
});

it("should return 200 on success", function() {
  return expect(namedDweetPost).to.have.status(200);
});

it("should specify success in the response 'this' field", function() {
  return expect(namedDweetPost).to.have.json("this", "succeeded");
});

it("should respond with the created dweet's data", function() {
  return expect(namedDweetPost).to.have.json("with.content", initialDweetData);
});

it("should use a dweet thing name if provided", function() {
  return expect(namedDweetPost).to.have.json("with.thing", specifiedThingName);
});

it("should allow retrieval of the last data point", function() {
  var dataRetrieval = chakram.get(
    "https://localhost:44307/api/openbooking/" + specifiedThingName
  );
  return expect(dataRetrieval).to.have.json(
    "with[0].content",
    initialDweetData
  );
});

it("should respond with data matching the dweet schema", function() {
  var expectedSchema = {
    type: "object",
    properties: {
      this: { type: "string" },
      by: { type: "string" },
      the: { type: "string" },
      with: {
        type: "object",
        properties: {
          thing: { type: "string" },
          created: { type: "string" },
          content: { type: "object" }
        },
        required: ["thing", "created", "content"]
      }
    },
    required: ["this", "by", "the", "with"]
  };
  return expect(namedDweetPost).to.have.schema(expectedSchema);
});

describe("anonymous thing name", function() {
  var generatedThingName, anonymousDweetPost;

  before(function() {
    anonymousDweetPost = chakram.put(
      "https://localhost:44307/api/openbooking/orders/1234",
      c1req
    );
    return anonymousDweetPost.then(function(respObj) {
      generatedThingName = respObj.body.with.thing;
    });
  });

  it("should succeed without a specified thing name, generating a random dweet thing name", function() {
    expect(anonymousDweetPost).to.have.status(200);
    expect(anonymousDweetPost).to.have.json("this", "succeeded");
    return chakram.wait();
  });

  it("should allow data retrieval using the generated thing name", function() {
    var data = chakram.get(
      "https://localhost:44307/api/openbooking/" + generatedThingName
    );
    return expect(data).to.have.json("with", function(dweetArray) {
      expect(dweetArray).to.have.length(1);
      var dweet = dweetArray[0];
      expect(dweet.content).to.deep.equal(initialDweetData);
      expect(dweet.thing).to.equal(generatedThingName);
    });
  });
});
