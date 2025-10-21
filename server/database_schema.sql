use EventManagement;

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "passwordHash"],
      properties: {
        name: {
          bsonType: "string"
        },
        email: {
          bsonType: "string"
        },
        passwordHash: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection("organizers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "organizationName", "contactNo"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        organizationName: {
          bsonType: "string"
        },
        description: {
          bsonType: "string"
        },
        contactNo: {
          bsonType: "string"
        },
        verified: {
          bsonType: "bool"
        }
      }
    }
  }
});

db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["category", "title", "description", "startDateTime", "endDateTime", "venue", "capacity", "ticketPrice", "organizerId"],
      properties: {
        category: {
          bsonType: "string"
        },
        title: {
          bsonType: "string"
        },
        description: {
          bsonType: "string"
        },
        startDateTime: {
          bsonType: "date"
        },
        endDateTime: {
          bsonType: "date"
        },
        venue: {
          bsonType: "string"
        },
        capacity: {
          bsonType: "number"
        },
        ticketPrice: {
          bsonType: "number"
        },
        status: {
          bsonType: "string"
        },
        organizerId: {
          bsonType: "objectId"
        },
        image: {
          bsonType: "string"
        }
      }
    }
  }
});

db.createCollection("registrations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "eventId"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        eventId: {
          bsonType: "objectId"
        },
        registrationDate: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection("savedevents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "eventId"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        eventId: {
          bsonType: "objectId"
        },
        savedDate: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection("admins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: {
          bsonType: "objectId"
        },
        role: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
});

db.users.createIndex({ "email": 1 }, { unique: true });
db.registrations.createIndex({ "userId": 1, "eventId": 1 }, { unique: true });
db.savedevents.createIndex({ "userId": 1, "eventId": 1 }, { unique: true });
db.admins.createIndex({ "userId": 1 }, { unique: true });