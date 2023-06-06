import React from "react";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  arrayUnion
} from "firebase/firestore";
import firebase from "./init-firebase.js";
import PromptAuth from "./PromptAuth.js"; //default export would require no '{}' braces
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signOut
} from "firebase/auth";
import Sudo from "./Sudo.js";
import Application from "./Application";
const forbiddenUsernames = [
  "event",
  "events",
  "club",
  "clubs",
  "shop",
  "shops",
  "restaurant",
  "restaurants",
  "service",
  "services",
  "dept",
  "department",
  "departments",
  "classes",
  "class",
  "oldclass",
  "oldclasses",
  "job",
  "jobs",
  "housing",
  "oldhome",
  "page",
  "pages",
  "venue",
  "venues",
  "forum",
  "posts",
  "post",
  "oldelection",
  "elections",
  "election",
  "case",
  "cases",
  "oldcase",
  "oldcases",
  "budget",
  "budgets",
  "oldbudget",
  "oldbudgets",
  "ordinance",
  "ordinances",
  "new",
  "news",
  "login",
  "logins",
  "doc",
  "docs",
  "private",
  "privacy",
  "legal",
  "terms",
  "law",
  "laws",
  "bill",
  "bills"
];
export const standardCatch = (e) => console.log(e);
const firestore = getFirestore(firebase);
class Auth extends React.Component {
  constructor(props) {
    super(props);
    var storedAuth = undefined;
    window.meAuth = undefined;
    this.state = {
      auth: undefined,
      user: undefined,
      meAuth: {},
      storedAuth
    };
    this.ra = React.createRef();
    this.pa = React.createRef();
    this.gui = React.createRef();
    this.Vintages = React.createRef();
  }
  componentDidUpdate = () => {
    if (window.meAuth !== this.state.lastAuth) {
      //console.log("window.meAuth", window.meAuth);
      this.setState({ lastAuth: window.meAuth }, () => {
        //console.log("this.state.lastAuth", this.state.lastAuth);
        if (window.meAuth !== undefined && this.props.rediret) {
          this.props.navigate(this.props.rediret);
        }
      });
    }
  };

  getEntities = (meAuth) => {
    const runRoles = () => {
      let iAmRepresentative = [];
      let iAmJudge = [];
      let iAmCandidate = [];
      onSnapshot(
        query(
          collection(firestore, "communities"),
          where("representatives", "array-contains", meAuth.uid)
        ),
        (querySnapshot) =>
          querySnapshot.docs.forEach((doc, i) => {
            var foo = doc.data();
            foo.id = doc.id;
            if (querySnapshot.docs.length === i) iAmRepresentative.push(foo);
          }),
        standardCatch
      );
      onSnapshot(
        query(
          collection(firestore, "communities"),
          where("judges", "array-contains", meAuth.uid)
        ),
        (querySnapshot) =>
          querySnapshot.docs.forEach((doc, i) => {
            var foo = doc.data();
            foo.id = doc.id;
            if (querySnapshot.docs.length === i) iAmJudge.push(foo);
          }),
        standardCatch
      );
      onSnapshot(
        query(
          collection(firestore, "elections"),
          where("candidates", "array-contains", meAuth.uid)
        ),
        (querySnapshot) =>
          querySnapshot.docs.forEach((doc, i) => {
            var foo = doc.data();
            foo.id = doc.id;
            if (querySnapshot.docs.length === i) iAmCandidate.push(foo);
          }),
        standardCatch
      );
      //snapshots cannot return without 'state', which uses DOM, or props:{}
    };
    onSnapshot(
      query(
        collection(firestore, "communities"),
        where("authorId", "==", meAuth.uid)
      ),
      (querySnapshot) => {
        let p = 0;
        let myCommunities = [];
        querySnapshot.docs.forEach((doc) => {
          p++;
          if (doc.exists) {
            var foo = doc.data();
            foo.id = doc.id;
            if (foo.authorId === meAuth.uid) myCommunities.push(foo);
          }
        });
        if (p === querySnapshot.docs.length)
          onSnapshot(
            query(
              collection(firestore, "communities"),
              where("admin", "array-contains", meAuth.uid)
            ),
            (querySnapshot) => {
              let pp = 0;
              querySnapshot.docs.forEach((doc) => {
                pp++;
                if (doc.exists) {
                  var foo = doc.data();
                  foo.id = doc.id;
                  if (foo.authorId === meAuth.uid) {
                    myCommunities.push(foo);
                  }
                }
              });
              if (pp === querySnapshot.docs.length)
                this.setState({
                  myCommunities
                });
            },
            standardCatch
          );
      },
      standardCatch
    );

    onSnapshot(
      query(
        collection(firestore, "tickets"),
        where("admittees", "array-contains", meAuth.uid)
      ),
      (querySnapshot) => {
        let tickets = [];
        let p = 0;
        querySnapshot.docs.forEach((doc) => {
          p++;
          if (doc.exists) {
            var foo = doc.data();
            foo.id = doc.id;
            tickets.push(foo);
          }
        });
        if (querySnapshot.docs.length === p) this.setState({ tickets });
      },
      standardCatch
    );

    runRoles();
  };
  getFolders = async (folderReference) =>
    await this.props.storageRef
      .child(folderReference)
      .listAll()
      .then((res) => {
        console.log("folders in: ");
        console.log(folderReference);
        //console.log(res); //{prefixes: Array(0), items: Array(1)}
        let folders = [];
        let p = 0;
        res._delegate.prefixes.forEach((reference) => {
          p++;
          // All the items under listRef.
          var food = reference._location.path_;
          //console.log(food);
          var foo = food.split(`personalCaptures/${window.meAuth.uid}/`)[1];
          folders.push(foo);
        });
        if (res.prefixes.length === p) {
          //console.log(folders);
          this.setState({ folders });
        }
      })
      .catch(standardCatch);
  //How many Italian Americans were fishmongers in the 18th century?
  render() {
    const hiddenUserData = (ath) => {
        //console.log("hiddenuserdata");
        onSnapshot(
          doc(firestore, "userDatas", ath.uid),
          (doc) => {
            var userDatas = undefined;
            if (doc.exists()) {
              var u = this.state.user;
              userDatas = doc.data(); //{...,doc.id}

              //delete u.defaultEmail;
              const user = {
                ...u,
                ...userDatas,
                userDatas: true
              };
              this.setState(
                {
                  user,
                  userDatas
                }
                //() => this.getEntities(meAuth)
              );
            } else
              console.log(
                `user: ${
                  this.state.user.username //+ " " + ath.uid
                }, has no hidden data`
              );
          },
          standardCatch
        );
      },
      logoutofapp = (yes) => {
        var answer = yes || window.confirm("Are you sure you want to log out?");
        if (!answer) {
          //this.ra.current.click();
          return this.gui.current.click();
        } //ra;//null;
        signOut(getAuth())
          .then(async () => {
            console.log("logged out");
            await setPersistence(getAuth(), browserSessionPersistence);
            this.setState({
              user: undefined,
              auth: undefined
            });
            this.ra.current.click();
          })
          .catch((err) => {
            console.log(err);
          });
      };
    const meAuth =
        window.meAuth &&
        window.meAuth.constructor === Object &&
        Object.keys(window.meAuth).length > 0
          ? window.meAuth
          : undefined,
      space = " ";
    return this.props.pathname === "/privacy" ? (
      <div>
        NetCo uses Quickbooks Online and Plaid to query purchases made with your
        banks and cards to reconcile adjacent purchases by date. Google Firebase
        Firestore stores your phone number with anonymous firebase rules for
        authentication, separate from the user and username queried-object.
        {space}
        <b onClick={() => this.props.navigate("/")}>back</b>
      </div>
    ) : this.props.pathname === "/terms" ? (
      <div>
        By using this app you agree to not surrender third party donee
        beneficiary rights to ownership or otherwise dispose of assets in any
        purchase contract.{space}
        <b onClick={() => this.props.navigate("/")}>back</b>
      </div>
    ) : (
      <div>
        <PromptAuth
          ref={{
            current: {
              pa: this.pa,
              gui: this.gui,
              ra: this.ra
            }
          }}
          onPromptToLogin={() => {}} //this.props.history.push("/login")}
          verbose={true}
          onStart={() => {
            //if (window.meAuth !== undefined) return this.props.navigate("/");
            window.alert("loading authentication...");
          }}
          onEnd={() => {
            //window.alert("loading authentication...");
          }}
          windowKey={"meAuth"} //window.meAuth
          hydrateUser={(me, reload, isStored) => {
            if (me && me.constructor === Object) {
              if (isStored) return console.log("isStored: ", me); //all but denied

              if (me.isAnonymous) return console.log("anonymous: ", me);

              if (!me.uid)
                return this.setState({
                  user: undefined,
                  auth: undefined
                });
              //console.log("me", me);
              //this.pa.current.click();

              onSnapshot(
                doc(firestore, "users", me.uid),
                (doc) =>
                  doc.exists() &&
                  this.setState(
                    {
                      user: { ...doc.data(), id: doc.id },
                      loaded: true
                    },
                    () => hiddenUserData(me)
                  )
              );
              return reload && window.location.reload();
            }
            console.log("me", me);
          }} //detract alternative, kurt carface bank
          onFinish={() => {}}
          meAuth={window.meAuth === undefined ? null : window.meAuth}
        />
        {meAuth === undefined && (
          <Sudo
            ref={{ current: {} }}
            forbiddenUsernames={forbiddenUsernames}
            phoneNumberCollection={"phoneNumbers"}
            width={this.props.width}
            rooturi={"https://quick.net.co/"} //comment out to use click
            homeuri={"https://quick.net.co"} // emulateRoot onroot instead
            logoutofapp={this.props.logoutofapp}
            auth={meAuth}
            lastWidth={this.props.lastWidth}
            availableHeight={this.props.appHeight}
            backgroundColor={null} //transparent
            position={"relative"}
            supportemail={"nick@quick.net.co"}
            welcomeName={"QuickNet - Bookkeeping facility"}
            onroot={true}
            emulateRoot={(e) => this.setState(e)}
            getUserInfo={() => this.gui.current.click()}
            setAuth={(auth) =>
              this.setState(auth, () => this.pa.current.click())
            }
            meAuth={meAuth}
            user={this.state.user}
            pathname={this.props.pathname}
            navigate={this.props.navigate}
            useTopComment={null}
            memberMessage=""
            subTop=""
            useTitle={<span></span>}
            useCan={null} //trash
            useCanComment={null}
            root={(a) => this.state.onroot && <div></div>}
            rootArguments={[
              {
                current: {}
              }
            ]}
            subRoot=""
            //emulateRoot={() => this.props.navigate("/")}
            home={!this.state.onroot && <div></div>} //Are drug gangs not pharmacists because they have no shop nor employees?
            //Do employees of regular businesses with diverse customers have to report gifted sweat up to $15,000 per year?
          />
        )}
        <span style={{ display: "flex" }}>
          {this.state.user !== undefined && this.state.user.subscriptionId && (
            <div
              style={{
                backgroundColor: "forestgreen",
                borderRadius: "10px",
                width: "20px",
                height: "20px",
                border: "1px dashed white"
              }}
              onClick={async () => {
                var answer = window.confirm(
                  "Would you like you delete your subscription? This cannot be undone."
                );
                answer &&
                  (await fetch(
                    "https://sea-turtle-app-cg9u4.ondigitalocean.app/deletesubscription",
                    {
                      method: "POST",
                      headers: {
                        "Access-Control-Request-Method": "POST",
                        "Access-Control-Request-Headers": [
                          "Origin",
                          "Content-Type"
                        ], //allow referer
                        "Content-Type": "Application/JSON"
                      },
                      body: JSON.stringify({
                        subscriptionId: this.state.user.subscriptionId
                      })
                    }
                  ) //stripe account, not plaid access token payout yet
                    .then(async (res) => await res.json())
                    .then(async (result) => {
                      if (result.status) return console.log(result);
                      if (result.error) return console.log(result);
                      if (!result.transactions)
                        return console.log("dev error (Cash)", result);
                    }));
              }}
            ></div>
          )}
          {space}$40/month |{space}
          <b onClick={() => this.props.navigate("/terms")}>terms</b>
          {space}|{space}
          <b onClick={() => this.props.navigate("/privacy")}>privacy</b>
          {space}|{space}nick@quick.net.co
        </span>
        <h2>Connect to QuickBooks to get started right away.</h2>
        Reconcile purchases in the same view as your bank and card transactions.
        {
          space
          /**Scopebook keeps track of expenses with issuable cards. */
        }
        {meAuth !== undefined && (
          <span
            onClick={() => logoutofapp()}
            style={{
              border: "1px solid",
              borderRadius: "2px",
              padding: "3px 6px"
            }}
          >
            logout of app
          </span>
        )}
        <Application
          auth={meAuth}
          width={this.props.width}
          height={this.props.appHeight}
          user={this.state.user}
          navigate={this.props.navigate}
        />
      </div>
    );
  }
}
export default Auth;
