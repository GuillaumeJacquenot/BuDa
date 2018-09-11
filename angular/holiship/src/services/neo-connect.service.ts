import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as neo4j_driver from 'neo4j-driver/lib/browser/neo4j-web.min.js';

const neo4j = neo4j_driver.v1;
const uri = 'bolt://130.66.124.234:7687';
//const uri = 'http://130.66.124.234:7474';
const user = 'neo4j';
// const password = 'neo4j';
const password = '1111';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {maxTransactionRetryTime: 15000});

const session = driver.session();

@Injectable()
export class NeoConnectService {

  private isConnected = new BehaviorSubject<any>({
    error: false,
    msg: ''
  });
  // Observable navItem stream
  ConnObservable = this.isConnected.asObservable();

  constructor() {
    // Register a callback to know if driver creation was successful:
    driver.onCompleted = function () {
      // proceed with using the driver, it was successfully instantiated
    };
    // Register a callback to know if driver creation failed.
    // This could happen due to wrong credentials or database unavailability:
    const self = this;
    driver.onError = function (error) {
      console.log('Driver instantiation failed', error);
      self.connLost(error);
    };

  }

  // service command
  connLost(msg) {
    this.isConnected.next({
      error: true,
      msg: msg
    });
  }

  getReqs(projName) {
    return session.run(`match (project:Project{name:"${projName}"})-[:Contain]
    -(requirement:Requirement)-[:Contain]-(reqver:RequirementVer)-[:CREATED_BY]->(usr:User) return requirement, reqver, usr
    ORDER BY requirement.date`);
  }

  createReqVer(projName: string,  req: any) {
    const now = new Date().toISOString();
    return session.run(`match (proj:Project{name:"${projName}"})-[:Contain]-(req:Requirement{id:'${req.id}'})
      match (usr:User{login:"${localStorage.getItem('user')}"})
      create (req)-[:Contain]->(reqVer:RequirementVer{ver:"${req.ver}", date: "${now}", desc: "${req.descr}", title:"${req.title}"})
      -[:CREATED_BY]->(usr)`);
  }

  deleteReqVer(projName: string, reqVer: any) {
    return session.run(`match (:Project{name:"${projName}"})-[:Contain]-
    (:Requirement{id:"${reqVer.id}"})-[:Contain]-(reqVer:RequirementVer{ver:"${reqVer.ver}"}) detach delete reqVer`);
  }

  createReq(projName: string, req: any) {
    const now = new Date().toISOString();

    return session.run(`match (proj:Project{name:"${projName}"})
      match (usr:User{login:"${localStorage.getItem('user')}"})
      create (proj)-[:Contain]->(req:Requirement{id:"${req.id}", date: "${now}"})-[:Contain]->
      (reqVer:RequirementVer{ver:"${req.ver}", date: "${now}", desc: "${req.descr}", title:"${req.title}"})
      -[:CREATED_BY]->(usr)`);
  }

  createBlock(projName, block: any) {
    const now = new Date().toISOString();
    return session.run(`match (proj:Project{name:"${projName}"})
    match (usr:User{login:"${localStorage.getItem('user')}"})
      create (proj)-[:Contain]->(nBlock:Block{name:"${block.name}", date: "${now}", parentProj:"${projName}", uId:"${block.id}"})<-[:Subscribed]-(usr)
      return nBlock`);
  }

  editBlock(projectName: string, nodeId: any, newName: string) {
    return session.run(`MATCH (block) WHERE id(block) = ${nodeId['low']}
    set block.name = "${newName}" return block`);
  }

  getNodeById(nodeId: any) {
    return session.run(`MATCH (node) WHERE id(node) = ${nodeId['low']}
    return node`);
  }

  deleteBlock(projName: string, nodeId: any) {
    return session.run(`MATCH (block) WHERE id(block) = ${nodeId['low']}
    optional match (block)-[:Contain]->(sub)
    detach delete block, sub`);
  }

  getScenarios(projName) {
    return session.run(`match (project:Project{name:"${projName}"})-[:Contain]
    -(scenario:Scenario)-[:Contain]-(scever:ScenarioVer)-[:CREATED_BY]->(usr:User) return scenario, scever, usr
    ORDER BY scenario.date`);
  }

  createSceVer(projName: string,  sce: any) {
    const now = new Date().toISOString();
    return session.run(`match (proj:Project{name:"${projName}"})-[:Contain]-(req:Scenario{id:'${sce.id}'})
      match (usr:User{login:"${localStorage.getItem('user')}"})
      create (req)-[:Contain]->(reqVer:ScenarioVer{ver:"${sce.ver}", date: "${now}", desc: "${sce.descr}", title:"${sce.title}"})
      -[:CREATED_BY]->(usr)`);
  }

  deleteSceVer(projName: string,  sce: any) {
    return session.run(`match (:Project{name:"${projName}"})-[:Contain]-(:Scenario{id:"${sce.id}"})-[:Contain]-
    (sceVer:ScenarioVer{ver:"${sce.ver}"})
       detach delete sceVer`);
  }

  createSce(projName, sce: any) {
    const now = new Date().toISOString();

    return session.run(`match (proj:Project{name:"${projName}"})
      match (usr:User{login:"${localStorage.getItem('user')}"})
      create (proj)-[:Contain]->(sce:Scenario{id:"${sce.id}", date: "${now}"})-[:Contain]->
      (sceVer:ScenarioVer{ver:"${sce.ver}", date: "${now}", desc: "${sce.descr}", title:"${sce.title}"})
      -[:CREATED_BY]->(usr)`);
  }

  getProjects() {
    return session.run(`MATCH (n:Project) RETURN n, n.name ORDER BY n.date`);
  }

  getBlocksOfProject(projectName: string) {
    return session.run(`MATCH (:Project{name:"${projectName}"})-[:Contain]->(blck:Block)
    RETURN blck
    ORDER BY blck.date`);
  }

  getScenarioReqs(projectName: string, scenarioID: string) {
    return session.run(`MATCH (:Project{name:"${projectName}"})-[:Contain]->(:Scenario{id:"${scenarioID}"})-[rel:Relates]->(req:Requirement)
    RETURN req, rel`);
  }

  getScenarioBlocks(projectName: string, scenarioID: string) {
    return session.run(`MATCH (:Project{name:"${projectName}"})-[:Contain]->(:Scenario{id:"${scenarioID}"})-[:Relates]->(blck:Block)
    RETURN blck`);
  }

  connectRequirementToScenario(projectName: string, scenarioID: string, requirementID: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->(s:Scenario{id:"${scenarioID}"})
    match (:Project{name:"${projectName}"})-[:Contain]->(r:Requirement{id:"${requirementID}"})
    create (s)-[:Relates]->(r)`);
  }

  connectBlockToScenario(projectName: string, scenarioID: string, blockId: any) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->(s:Scenario{id:"${scenarioID}"})
    MATCH (b:Block) where ID(b)=${blockId['low']}
    create (s)-[:Relates]->(b)`);
  }

  disconnectRequirementFromScenario(projectName: string, scenarioID: string, requirementID: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->(:Scenario{id:"${scenarioID}"})-
    [rel:Relates]->(:Requirement{id:"${requirementID}"})
    delete rel`);
  }

  disconnectBlockFromScenario(projectName: string, scenarioID: string, blockId: any) {
    return session.run(`MATCH (b:Block) where ID(b)=${blockId['low']}
    match (:Project{name:"${projectName}"})-[:Contain]->(:Scenario{id:"${scenarioID}"})-
    [rel:Relates]->(b)
    delete rel`);
  }

  createProject(projectName: string) {
    const now = new Date().toISOString();
    return session.run(`create (:Project{name:"${projectName}", date: "${now}"})`);
  }

  getRelatedScenarios(projectName: string, id: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]-
    (requirement:Requirement{id:"${id}"})<-[rel:Relates]-(sce:Scenario)
    return sce, rel`);
  }

  auth(login: string, pass: string) {
    return session.run(`match (user:User{login:"${login}", password:"${pass}", active: true})
    return user`);
  }

  getUsers() {
    return session.run(`match (user:User) return user`);
  }

  createUser(login: string, pass: string) {
    const now = new Date().toISOString();
    return session.run(`create (:User{login:"${login}", password:"${pass}", date: "${now}", active: true})`);
  }

  checkUserExistence (login: string) {
    return session.run(`match (user:User{login:"${login}", active: true})
    return user.login`);
  }

  changeUserPassword(login: string, newPass: string) {
    return session.run(`match (user:User{login:"${login}"})
    set user.password = "${newPass}" return user`);
  }

  activateUser(login: string) {
    return session.run(`match (user:User{login:"${login}"})
    set user.active = true return user`);
  }

  deactivateUser(login: string) {
    return session.run(`match (user:User{login:"${login}"})
    set user.active = false return user`);
  }

  deleteRequirement(projectName: string, reqId: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->
    (req:Requirement{id:"${reqId}"})-[:Contain]->(reqVer:RequirementVer)
    detach delete reqVer, req`);
  }

  deleteScenario(projectName: string, reqId: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->(sce:Scenario{id:"${reqId}"})-[:Contain]->(sceVer:ScenarioVer)
    detach delete sceVer, sce`);
  }

  createNotification(projectName: string, itemType: string, itemId: string, action: string, body: string) {
    const now = new Date().toISOString();
    return session.run(`match (proj:Project{name:"${projectName}"})
    create (proj)-[:Contain]->
    (:Notification{itemType:"${itemType}", itemId:"${itemId}", action:"${action}", body:"${body}", timestamp:"${now}"})`);
  }

  getNotifications(projectName: string) {
    return session.run(`match (:Project{name:"${projectName}"})-[:Contain]->(n:Notification)
    return n
    order by n.timestamp`);
  }

  subscribeToNotifications(projectName: string, nodeType: string, nodeId: string) {
    if (nodeType.toLowerCase() === 'requirement') {
      return session.run(`match (usr:User{login:"${localStorage.getItem('user')}"})
      match (:Project{name:"${projectName}"})-[:Contain]->(req:Requirement{id:"${nodeId}"})
      create (usr)-[:Subscribed]->(req)`);
    } else if (nodeType.toLowerCase() === 'scenario') {
      return session.run(`match (usr:User{login:"${localStorage.getItem('user')}"})
      match (:Project{name:"${projectName}"})-[:Contain]->(sce:Scenario{id:"${nodeId}"})
      create (usr)-[:Subscribed]->(sce)`);
    } else if (nodeType.toLowerCase() === 'block') {
      return session.run(`match (usr:User{login:"${localStorage.getItem('user')}"})
      match (:Project{name:"${projectName}"})-[:Contain]->(block:Block{name:"${nodeId}"})
      create (usr)-[:Subscribed]->(block)`);
    }
  }

  subscribeBlockToNotifications(nodeId: any) {
    return session.run(`match (usr:User{login:"${localStorage.getItem('user')}"})
      MATCH (block) WHERE id(block) = ${nodeId['low']}
      create (usr)-[:Subscribed]->(block)`);
  }

  unsubscribeFromNotifications(projectName: string, nodeType: string, nodeId: string) {
    if (nodeType.toLowerCase() === 'requirement') {
      return session.run(`match (:User{login:"${localStorage.getItem('user')}"})-[sub:Subscribed]->
      (:Requirement{id:"${nodeId}"})<-[:Contain]-(:Project{name:"${projectName}"})
      delete sub`);
    } else if (nodeType.toLowerCase() === 'scenario') {
      return session.run(`match (:User{login:"${localStorage.getItem('user')}"})-[sub:Subscribed]->
      (:Scenario{id:"${nodeId}"})<-[:Contain]-(:Project{name:"${projectName}"})
      delete sub`);
    } else if (nodeType.toLowerCase() === 'block') {
      return session.run(`match (:User{login:"${localStorage.getItem('user')}"})-[sub:Subscribed]->
      (:Block{name:"${nodeId}"})<-[:Contain]-(:Project{name:"${projectName}"})
      delete sub`);
    }
  }

  unsubscribeBlockFromNotifications(nodeId: any) {
    return session.run(` MATCH (block) WHERE id(block) = ${nodeId['low']}
    match (:User{login:"${localStorage.getItem('user')}"})-[sub:Subscribed]->(block)
    delete sub`);
  }

  getUserNotificationSubscribtions(projectName: string) {
    return session.run(`match(:User{login:"${localStorage.getItem('user')}"})-[:Subscribed]->(n)
    return n`);
  }

  runExternalCode(code: string) {
    return session.run(code);
  }

  getTransitions(projectName: string, blockId: any) {
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State)-[tr:Transition]->(stt:State)
    return stf, tr.name, stt`);
  }

  getStates(projectName: string, blockId: any) {
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State)
    return stf`);
  }

  editState(projectName: string, blockId: any, stateOldName: string, stateNewName: string) {
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State{name:"${stateOldName}"})
    set stf.name = "${stateNewName}" return stf`);
  }

  createState(projectName: string, blockId: any, stateName: string) {
    const now = new Date().toISOString();
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    create (block)-[:Has]->(stf:State{name:"${stateName}", date: "${now}"})`);
  }

  createTransition(projectName: string, blockId: any, stateFromName: string, stateToName: string, transitionName: string) {
    const now = new Date().toISOString();
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State{name:"${stateFromName}"})
    match (block)-[:Has]->(stt:State{name:"${stateToName}"})
    create (stf)-[:Transition{name: "${transitionName}", date: "${now}"}]->(stt)`);
  }

  deleteTransition(projectName: string, blockId: any, stateFromName: string, stateToName: string, transitionName: string) {
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State{name:"${stateFromName}"})
    -[tr:Transition{name: "${transitionName}"}]->(stt:State{name:"${stateToName}"})
    delete tr`);
  }

  deleteState(projectName: string, blockId: any, stateName: string) {
    return session.run(`MATCH (block:Block) where ID(block)=${blockId['low']}
    match (block)-[:Has]->(stf:State{name:"${stateName}"})
    detach delete stf`);
  }

  createRevisionRequirements(projectName: string, revisionName: string, requirements: Array<any>) {
    const now = new Date().toISOString();
    let requestBody = `match (proj: Project{name: "${projectName}"})`;
    let creatingPartOfBody = ` create (proj)-[:Contain]->(rev:ReqRevision{date: "${now}", name: "${revisionName}"})`;
    for (let i = 0; i < requirements.length; i++) {
      requestBody += ` match (proj)-[:Contain]->(:Requirement{id: "${requirements[i].id}"})-[:Contain]->
      (${requirements[i].id}:RequirementVer{ver: "${requirements[i].ver}"})`;
      creatingPartOfBody += ` create (rev)-[:Contain]->(${requirements[i].id})`;
    }
    return session.run(requestBody + creatingPartOfBody);
  }

  createRevisionScenario(projectName: string, revisionName: string, scenarios: Array<any>) {
    const now = new Date().toISOString();
    let requestBody = `match (proj: Project{name: "${projectName}"})`;
    let creatingPartOfBody = ` create (proj)-[:Contain]->(rev:SceRevision{date: "${now}", name: "${revisionName}"})`;
    for (let i = 0; i < scenarios.length; i++) {
      requestBody += ` match (proj)-[:Contain]->(:Scenario{id: "${scenarios[i].id}"})-[:Contain]->
      (${scenarios[i].id}:ScenarioVer{ver: "${scenarios[i].ver}"})`;
      creatingPartOfBody += ` create (rev)-[:Contain]->(${scenarios[i].id})`;
    }
    return session.run(requestBody + creatingPartOfBody);
  }

  getBlockChildren(projectName: string, parentBlocks: Array<any>) {
    let request = `match (proj: Project{name: "${projectName}"})`;
    for (let i = 0; i < parentBlocks.length; i++) {
      request += `-[:Contain]->(:Block{name: "${parentBlocks[i]}"})`;
    }
    request += `-[:Contain]->(block:Block)
    return block
    ORDER BY block.date`;
    // console.log('request ',request, parentBlocks)
    return session.run(request);
  }

  getBlockChildrenByID(projectName: string, blockId: any) {
    const request = `MATCH (blck) WHERE id(blck) = ${blockId['low']}
    MATCH (blck)-[:Contain]->(block:Block)
    return block
    ORDER BY block.date`;
    // console.log('request ', request);
    return session.run(request);
  }

  getLinkedBlocksByID(blockId: any) {
    const request = `MATCH (blck) WHERE id(blck) = ${blockId['low']}
    MATCH (blck)<-[:LINKED_TO]-(block:Block)
    return block`;
    // ORDER BY block.date`;
    return session.run(request);
  }

  createNewBlockChild(projectName: string, parentBlocks: Array<any>, block: any) {
    const now = new Date().toISOString();
    let request = `match (user:User{login:"${localStorage.getItem('user')}"})
    match (proj: Project{name: "${projectName}"})`;
    for (let i = 0; i < parentBlocks.length; i++) {
      request += `-[:Contain]->(${parentBlocks[i]}:Block{name: "${parentBlocks[i]}"})`;
    }
    request += ` create (${parentBlocks[parentBlocks.length - 1]})-[:Contain]->(:Block{name:"${block.name}", parentProj:"${projectName}", uId:"${block.id}", date: "${now}"})<-[:Subscribed]-(user)`;
    return session.run(request);
  }

  createNewBlockChildById(projectName: string, blockId: any, block: any) {
    const now = new Date().toISOString();
    let request = `match (user:User{login:"${localStorage.getItem('user')}"})
    MATCH (block:Block) where ID(block)=${blockId['low']}`;
    request += ` create (block)-[:Contain]->(nBlock:Block{name:"${block.name}", parentProj:"${projectName}", uId:"${block.id}", date: "${now}"})<-[:Subscribed]-(user)`;
    request += ` return nBlock`;
    return session.run(request);
  }

  // createNewBlockConnToChildById(projectName: string, blockId: any, block: any) {
  //   const now = new Date().toISOString();
  //   let request = `match (user:User{login:"${localStorage.getItem('user')}"})
  //   MATCH (block:Block) where ID(block)=${blockId['low']}`;
  //   request += ` create (block)-[r:LINKED_TO{date: "${now}", uId: "${edgeUId}"}]->(nBlock:Block{name:"${block.name}", parentProj:"${projectName}", uId:"${block.id}", date: "${now}"})<-[:Subscribed]-(user)`;
  //   request += ` return nBlock`;
  //   return session.run(request);
  // }

  createNewBlockChildByUId(projectName: string, block: any) {
    const now = new Date().toISOString();
    const request = `match (user:User{login:"${localStorage.getItem('user')}"})
    MATCH (block:Block{parentProj: "${projectName}", uId: "${block.parent}"})
    create (block)-[:Contain]->(nBlock:Block{name:"${block.name}", parentProj:"${projectName}", uId:"${block.id}", date: "${now}"})<-[:Subscribed]-(user)
    return nBlock`;
    console.log('request => ', request);
    return session.run(request);
  }

  createBlocksEdge(projectName: string, parentUId: any, childUId: any, edgeUId: any) {
    const now = new Date().toISOString();
    const request = `MATCH (parent:Block{parentProj: "${projectName}", uId: "${parentUId}"})
                     MATCH (child:Block{parentProj: "${projectName}", uId: "${childUId}"})
                     CREATE (parent)-[r:LINKED_TO{date: "${now}", uId: "${edgeUId}"}]->(child)
                     RETURN r, parent, child`;

    return session.run(request);
  }

  deleteBlockWithChildrenById(blockId: any) {
    console.log('deleting block =>', blockId);
    const request = `MATCH (block) WHERE id(block) = ${blockId['low']}
     OPTIONAL MATCH (block)-[:Contain*0..]->(x)
     OPTIONAL MATCH (x)-[:Has]->(state)
     OPTIONAL MATCH (state)-[:transition*0..]->(subState)
     DETACH DELETE block,x,state,subState
     RETURN block,x,state,subState`;

    return session.run(request);
  }

  deleteProjectbyName(projName: string) {
    const request = `MATCH (project:Project{name:"${projName}"});
    OPTIONAL MATCH (project)-[*0..]->(x)
    DETACH DELETE project, x
    RETURN project`;

    return session.run(request);
  }

  deleteProjectByID(projId: any) {
    const request = `MATCH (project) WHERE id(project) = ${projId['low']}
    OPTIONAL MATCH (project)-[:Contain*0..]->(x)
    OPTIONAL MATCH (x)-[:Has]->(state)
    OPTIONAL MATCH (state)-[:transition*0..]->(subState)
    DETACH DELETE project, x, state, subState
    RETURN project`;

    return session.run(request);
  }

  editProjectNamebyID(projId: any, newName: string) {
    return session.run(`MATCH (project) WHERE id(project) = ${projId['low']}
    set project.name = "${newName}" return project`);
  }
}
