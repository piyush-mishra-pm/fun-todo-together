# **Fun-ToDo-Together**

A Todo App at heart, which also uses third party APIs for entertainment, and a Chat Engine. Built using Node-JS.


## **Video Walkthrough**:
[![Video Walkthrough](https://img.youtube.com/vi/JZVSObpzrlk/maxresdefault.jpg)](https://youtu.be/JZVSObpzrlk)

---
---

## **Features**:
- Minimalistic design.
- Authentication using Json Web Tokens (JWT).
- Tasks can be paginated, filtered and sorted.
- Custom tags can be created by user and added to tasks.
- Entertainment:
  - Uses 2 public APIs to offer entertainment services:
    - NASA public API
    - Poetry of the day API.

---
---

## **Technical Features:**
- **2 tier architecture**: Node at backend server, and MongoDB DB at another DB server. Clients are server server side rendered pages from Node backend server.
- **Folder structure**: Model View Controller pattern for organizing codebase. Routes are also separated on feature basis (``` auth, user, task, entertainment,```  etc.). ``` public``` folder for files (Js, CSS) served statically to the client.
- **Server side rendered** pages using **EJS (Viewing engine)**.
- **Jest Unit tests** for user functions and todo related functions. **Fixtures** for seeding test data in separate MongoDB collection.
- Authentication using **Json Web Tokens** (JWT). Passwords stored after encrypting with ```bcryptjs```. SignUp only allows unique email-IDs.

---
---
## **Todos**:
- Chat system.
- Video connference system.