import React from "react";
import { standardCatch } from "../Sudo";
import { PlaidLink } from "react-plaid-link";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getFirestore,
  updateDoc
} from "firebase/firestore";
import firebase from ".././init-firebase.js";

const firestore = getFirestore(firebase);

class Account extends React.Component {
  state = {};
  render() {
    const { x } = this.props;
    return (
      <div style={{ display: "flex" }}>
        <input
          name="items"
          style={{
            borderRadius: "6px",
            border: "1px solid",
            padding: "0px 4px",
            marginRight: "4px"
          }}
          onClick={() => this.props.listTransactions(x)}
          type="radio"
        />
        <div
          style={{
            borderRadius: "6px",
            border: "1px solid",
            padding: "0px 4px",
            marginRight: "4px"
          }}
          onClick={async () => {
            var answer = window.confirm("Delete authorization?");
            if (answer) {
              await fetch(
                "https://sea-turtle-app-cg9u4.ondigitalocean.app/remove",
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
                  body: JSON.stringify({ access_token: x })
                }
              ) //stripe account, not plaid access token payout yet
                .then(async (res) => await res.json())
                .then(async (result) => {
                  if (result.status) return console.log(result);
                  if (result.error) return console.log(result);
                  if (!result.removal)
                    return console.log("dev error (Cash)", result);
                  console.log("removal", result.removal);
                  updateDoc(doc(firestore, "userDatas", this.props.auth.uid), {
                    accessTokens: arrayRemove(x)
                  });
                })
                .catch(standardCatch);
            }
          }}
        >
          &times;
        </div>
        {this.state.institution ? (
          this.state.institution
        ) : (
          <div
            onClick={async () => {
              await fetch(
                "https://sea-turtle-app-cg9u4.ondigitalocean.app/detail",
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
                  body: JSON.stringify({ access_token: x })
                }
              ) //stripe account, not plaid access token payout yet
                .then(async (res) => await res.json())
                .then(async (result) => {
                  if (result.status) return console.log(result);
                  if (result.error) return console.log(result);
                  if (!result.detail)
                    return console.log("dev error (Cash)", result);
                  console.log("detail", result.detail);
                  this.setState({
                    institution: result.detail.institution.name
                  });
                })
                .catch(standardCatch);
            }}
          >
            {x}
          </div>
        )}
      </div>
    );
  }
}

class Application extends React.Component {
  state = {
    cardholders: [
      {
        individual: {
          first_name: "Linda",
          last_name: "Hughes"
        }
        /*spending_controls: {
          spending_limits: [
            {
              interval: "weekly",
              amount: 1000
            }
          ]
        }*/
      }
    ],
    plaidTransactions: [],
    quickbooksTransactions: [],
    accounts: [],
    vendors: [],
    customers: [],
    banks: [],
    date: new Date(),
    chosenAccount: "accounts",
    chosenCustomer: "customers"
  };
  componentDidUpdate = async (prevProps) => {
    if (this.props.auth !== prevProps.auth) {
      const state = new URLSearchParams(window.location.search).get("state");
      if (state === "intuit-test") {
        //const clientSec = new URLSearchParams(window.location.search).get("code");
        await fetch(
          "https://sea-turtle-app-cg9u4.ondigitalocean.app/quickbookscallback",
          {
            method: "POST",
            headers: {
              "Access-Control-Request-Method": "POST",
              "Access-Control-Request-Headers": ["Origin", "Content-Type"], //allow referer
              "Content-Type": "Application/JSON"
            },
            body: JSON.stringify({ url: window.location.href })
          }
        ) //stripe account, not plaid access token payout yet
          .then(async (res) => await res.json())
          .then(async (result) => {
            if (result.status) return console.log(result);
            if (result.error) return console.log(result);
            if (!result.companyIDToken)
              return console.log("dev error (Cash)", result);
            console.log("companyID", result.companyIDToken, this.props.auth);

            updateDoc(doc(firestore, "userDatas", this.props.auth.uid), {
              quickbooks: arrayUnion(result.companyIDToken)
            });
          })
          .catch(standardCatch);
      }
    }
  };
  render() {
    const space = " ";
    //console.log(this.state.banks);
    const stripeaccount = this.state.banks.find((x) => x);
    //console.log(this.props.auth);
    return (
      this.props.auth !== undefined && (
        <div style={{ margin: 5 }}>
          <div
            onClick={async () => {
              updateDoc(doc(firestore, "userDatas", this.props.auth.uid), {
                quickbooks: []
              });
              await fetch(
                "https://sea-turtle-app-cg9u4.ondigitalocean.app/quickbooks",
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
                  body: JSON.stringify({})
                }
              ) //stripe account, not plaid access token payout yet
                .then(async (res) => await res.json())
                .then(async (result) => {
                  if (result.status) return console.log(result);
                  if (result.error) return console.log(result);
                  if (!result.authUri)
                    return console.log("dev error (Cash)", result);
                  console.log(result.authUri, result.oauthClient);
                  window.location.href = result.authUri;
                })
                .catch(standardCatch);
            }}
          >
            Sign in with Quickbooks
          </div>

          {this.props.user !== undefined &&
            this.props.user.quickbooks &&
            this.props.user.quickbooks.map((x, i) => {
              return (
                <div key={i} style={{ display: "flex" }}>
                  <div
                    style={{
                      borderRadius: "6px",
                      border:
                        "1px solid " +
                        (this.state.selectedQuickbooks === x
                          ? "blue"
                          : "dimgrey"),
                      padding: "0px 4px",
                      marginRight: "4px"
                    }}
                    onClick={async () => {
                      await fetch(
                        "https://sea-turtle-app-cg9u4.ondigitalocean.app/quickbookscustomer",
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
                          body: JSON.stringify({ companyIDToken: x })
                        }
                      ) //stripe account, not plaid access token payout yet
                        .then(async (res) => await res.json())
                        .then(async (result) => {
                          if (result.status) return console.log(result);
                          if (result.error) return console.log(result);
                          if (!result.accounts)
                            return console.log("dev error (Cash)", result);
                          const accountss = JSON.parse(result.accounts.body);
                          const accounts = accountss.QueryResponse.Account.filter(
                            (x) => x.Classification === "Expense"
                          );
                          const banks = accountss.QueryResponse.Account.filter(
                            (x) => x.Classification === "Bank"
                          );
                          const vendors = JSON.parse(result.vendors.body);
                          const customers = JSON.parse(result.customers.body);
                          console.log(x, accounts, vendors);
                          this.setState({
                            selectedQuickbooks: x,
                            vendors: vendors.QueryResponse.Vendor,
                            accounts, //: accounts.QueryResponse.Account,
                            customers: customers.QueryResponse.Customer,
                            banks
                          });
                        })
                        .catch(standardCatch);
                    }}
                  >
                    =
                  </div>
                  {this.state.companyInfo ? (
                    this.state.companyInfo
                  ) : (
                    <div
                      onClick={async () => {
                        await fetch(
                          "https://sea-turtle-app-cg9u4.ondigitalocean.app/quickbooksinfo",
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
                            body: JSON.stringify({ companyIDToken: x })
                          }
                        ) //stripe account, not plaid access token payout yet
                          .then(async (res) => await res.json())
                          .then(async (result) => {
                            if (result.status) return console.log(result);
                            if (result.error) return console.log(result);
                            if (!result.companyInfo)
                              return console.log("dev error (Cash)", result);
                            const companyInfo = JSON.parse(
                              result.companyInfo.body
                            );
                            console.log("companyInfo", companyInfo);
                            this.setState({
                              companyInfo:
                                companyInfo.QueryResponse.CompanyInfo[0]
                                  .LegalName
                            });
                          })
                          .catch(standardCatch);
                      }}
                    >
                      {x.split(":")[0]}
                    </div>
                  )}
                </div>
              );
            })}
          {this.state.plaid_link ? (
            <PlaidLink
              style={{ padding: "20px", fontSize: "16px", cursor: "pointer" }}
              token={this.state.plaid_link}
              onSuccess={async (publicToken, metadata) => {
                // send public_token to your server
                // https://plaid.com/docs/api/tokens/#token-exchange-flow
                console.log(publicToken, metadata);

                await fetch(
                  "https://sea-turtle-app-cg9u4.ondigitalocean.app/plaid",
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
                    body: JSON.stringify({ public_token: publicToken })
                  }
                ) //stripe account, not plaid access token payout yet
                  .then(async (res) => await res.json())
                  .then(async (result) => {
                    if (result.status) return console.log(result);
                    if (result.error) return console.log(result);
                    if (!result.access_token)
                      return console.log("dev error (Cash)", result);
                    console.log("access_token", result.access_token);
                    updateDoc(
                      doc(firestore, "userDatas", this.props.auth.uid),
                      {
                        accessTokens: arrayUnion(result.access_token)
                      }
                    );
                  })
                  .catch(standardCatch);
              }}
              onEvent={(eventName, metadata) => {
                // log onEvent callbacks from Link
                // https://plaid.com/docs/link/web/#onevent
                console.log(eventName, metadata);
              }}
              onExit={(error, metadata) => {
                // log onExit callbacks from Link, handle errors
                // https://plaid.com/docs/link/web/#onexit
                console.log(error, metadata);
              }}
            >
              Load bank plaidTransactions
            </PlaidLink>
          ) : (
            <div
              onClick={async () => {
                await fetch(
                  "https://sea-turtle-app-cg9u4.ondigitalocean.app/link",
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
                    body: JSON.stringify({})
                  }
                ) //stripe account, not plaid access token payout yet
                  .then(async (res) => await res.json())
                  .then(async (result) => {
                    if (result.status) return console.log(result);
                    if (result.error) return console.log(result);
                    if (!result.link_token)
                      return console.log("dev error (Cash)", result);
                    this.setState({ plaid_link: result.link_token });
                  })
                  .catch(standardCatch);
              }}
            >
              Connect your bank account
            </div>
          )}
          <form onSubmit={(e) => e.preventDefault()}>
            {this.props.user !== undefined &&
              this.props.user.accessTokens &&
              this.props.user.accessTokens.map((x, i) => {
                return (
                  <Account
                    x={x}
                    key={i}
                    auth={this.props.auth}
                    listTransactions={async (x) => {
                      this.setState({ selectedItem: x });
                    }}
                    selectedItem={this.state.selectedItem}
                  />
                );
              })}
          </form>
          <hr style={{ margin: "10px" }} />
          <h3
            style={{
              display: "flex"
            }}
          >
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid",
                padding: "0px 4px",
                marginRight: "4px"
              }}
              onClick={() => {
                this.setState({
                  date: new Date(this.state.date.getTime() - 31556926000)
                });
              }}
            >
              {"<"}
            </div>
            My Transactions
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid",
                padding: "0px 4px",
                marginLeft: "4px"
              }}
              onClick={() => {
                if (
                  new Date(this.state.date.getTime() + 11556926000) < new Date()
                )
                  this.setState({
                    date: new Date(this.state.date.getTime() + 31556926000)
                  });
              }}
            >
              {">"}
            </div>
            {space}
            <div
              style={{
                borderRadius: "6px",
                border: this.state.trieddate !== this.state.date && "1px solid",
                marginLeft: "10px"
              }}
              onClick={async () => {
                if (!this.state.selectedItem)
                  return window.alert("you must select an account.");
                if (!this.state.selectedQuickbooks)
                  return window.alert("please load (=) QuickBooks");
                const zeropad = (x) => (String(x).length === 1 ? "0" + x : x);
                const { date } = this.state;
                const yearsago = new Date(date.getTime() - 31556926000);
                const start_month = zeropad(yearsago.getMonth() + 1),
                  start_date =
                    yearsago.getFullYear() +
                    "-" +
                    start_month +
                    "-" +
                    zeropad(yearsago.getDate()),
                  end_month = zeropad(date.getMonth() + 1),
                  end_date =
                    date.getFullYear() +
                    "-" +
                    end_month +
                    "-" +
                    zeropad(date.getDate());
                //return console.log(start_date, end_date);
                await fetch(
                  "https://sea-turtle-app-cg9u4.ondigitalocean.app/transactions",
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
                      companyIDToken: this.state.selectedQuickbooks,
                      access_token: this.state.selectedItem,
                      start_date,
                      end_date
                    })
                  }
                ) //stripe account, not plaid access token payout yet
                  .then(async (res) => await res.json())
                  .then(async (result) => {
                    if (result.status) return console.log(result);
                    if (result.error) return console.log(result);
                    if (!result.transactions)
                      return console.log("dev error (Cash)", result);
                    const purchases = JSON.parse(result.purchases.body);
                    console.log(
                      "transactions,purchases",
                      result.transactions,
                      purchases
                    );
                    purchases.QueryResponse &&
                      purchases.QueryResponse.Purchase &&
                      this.setState({
                        quickbooksTransactions:
                          purchases.QueryResponse.Purchase,
                        plaidTransactions: result.transactions,
                        trieddate: this.state.date
                      });
                  })
                  .catch(standardCatch);
              }}
            >
              {this.state.date.toLocaleDateString()}
            </div>
          </h3>
          <table style={{ color: "grey" }}>
            <thead></thead>
            <tbody>
              {[
                ...this.state
                  .quickbooksTransactions /*.filter(
                  (x) =>
                    !this.state.plaidTransactions.find(
                      (y) =>
                        /*x.CustomerRef.name ===
                          (y.merchant_name ? y.merchant_name : y.name) &&
                        x.TotalAmt === y.amount* /
                        new Date(x.MetaData.CreateTime) === y.created
                    ) //https://stripe.com/docs/issuing/purchases/transactions
                )*/, //https://stripe.com/docs/api/balance_transactions/list
                //https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/purchase#the-purchase-object
                ...this.state.plaidTransactions
              ]
                .sort((a, b) => {
                  const date = (x) =>
                    x.MetaData
                      ? new Date(x.MetaData.CreateTime)
                      : new Date(x.date);
                  return date(b) - date(a);
                })
                .map((x, i) => {
                  const amount = x.TotalAmt ? x.TotalAmt : x.amount;
                  const date = x.MetaData
                    ? new Date(x.MetaData.CreateTime).toLocaleDateString()
                    : x.date; //x.Date
                  const name = x.EntityRef //x.DisplayName
                    ? x.EntityRef.name
                    : x.merchant_name
                    ? x.merchant_name
                    : x.name;
                  return (
                    <tr key={i}>
                      <td>
                        {!x.MetaData && (
                          <div
                            onClick={() => {
                              if (
                                !this.state.chosenCustomer ||
                                !this.state.chosenAccount
                              )
                                return window.alert(
                                  "please choose a customer AND account"
                                );
                              //purchase or delete from quickbooks
                              const purchase = {
                                paymentType: "CreditCard",
                                AccountRef: this.state.chosenAccount,
                                DetailType: "AccountBasedExpenseLineDetail",
                                Amount: x.amount,
                                AccountBasedExpenseLineDetail: {
                                  AccountRef: this.state.chosenAccount,
                                  CustomerRef: this.state.chosenCustomer
                                }
                              };
                            }}
                            style={{
                              width: "30px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              borderRadius: "15px",
                              border: "1px solid"
                            }}
                          >
                            <div
                              style={{
                                transform: `translateX(${
                                  x.Line &&
                                  x.Line[0].AccountBasedExpenseLineDetail &&
                                  x.Line[0].AccountBasedExpenseLineDetail
                                    .CustomerRef
                                    ? "0px"
                                    : "10px"
                                })`,
                                margin: "0px 3px",
                                width: "13px",
                                height: "13px",
                                borderRadius: "10px",
                                border: "1px solid",
                                backgroundColor: "yellowgreen"
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td>{amount}</td>
                      <td>
                        {!x.MetaData ? (
                          <select style={{ width: "80px" }}>
                            {[{ DisplayName: name }, ...this.state.vendors].map(
                              (y, i) => {
                                return <option key={i}>{y.DisplayName}</option>;
                              }
                            )}
                          </select>
                        ) : (
                          <div
                            style={{
                              height: "20px",
                              position: "relative",
                              overflow: "hidden",
                              width: "80px"
                            }}
                          >
                            <div
                              style={{
                                height: "40px",
                                position: "relative",
                                overflowX: "auto",
                                width: "80px"
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  width: "max-content"
                                }}
                              >
                                {name}
                              </span>
                            </div>
                          </div> // && name.substring(0, 12)
                        )}
                      </td>
                      <td>
                        {["payout", "charge", "issuing_transaction"].includes(
                          x.type
                        )
                          ? "-"
                          : ""}
                      </td>
                      <td>
                        {x.MetaData ? (
                          <div
                            style={{
                              height: "20px",
                              position: "relative",
                              overflow: "hidden",
                              width: "80px"
                            }}
                          >
                            <div
                              style={{
                                height: "40px",
                                position: "relative",
                                overflowX: "auto",
                                width: "80px"
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  width: "max-content"
                                }}
                              >
                                {x.Line &&
                                  x.Line[0].AccountBasedExpenseLineDetail &&
                                  x.Line[0].AccountBasedExpenseLineDetail
                                    .AccountRef &&
                                  x.Line[0].AccountBasedExpenseLineDetail
                                    .AccountRef.name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <select
                            style={{ width: "80px" }}
                            value={this.state.chosenAccount}
                            onChange={(e) =>
                              this.setState({
                                chosenAccount: x.Name
                              })
                            }
                          >
                            {[{ Name: "accounts" }, ...this.state.accounts].map(
                              (x, i) => (
                                <option key={i}>{x.Name}</option>
                              )
                            )}
                          </select>
                        )}
                      </td>
                      <td>{date}</td>
                      <td>
                        {x.MetaData ? (
                          <div
                            style={{
                              height: "20px",
                              position: "relative",
                              overflow: "hidden",
                              width: "80px"
                            }}
                          >
                            <div
                              style={{
                                height: "40px",
                                position: "relative",
                                overflowX: "auto",
                                width: "80px"
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  width: "max-content"
                                }}
                              >
                                {x.Line &&
                                  x.Line[0].AccountBasedExpenseLineDetail &&
                                  x.Line[0].AccountBasedExpenseLineDetail
                                    .CustomerRef &&
                                  x.Line[0].AccountBasedExpenseLineDetail
                                    .CustomerRef.name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <select
                            style={{ width: "80px" }}
                            value={this.state.chosenCustomer}
                            onChange={(e) =>
                              this.setState({
                                chosenCustomer: x.DisplayName
                              })
                            }
                          >
                            {[
                              { DisplayName: "customers" },
                              ...this.state.customers
                            ].map((x, i) => {
                              /*if (
                                !x.Line ||
                                !x.Line[0].AccountBasedExpenseLineDetail
                                  .CustomerRef ||
                                x.Line[0].AccountBasedExpenseLineDetail
                                  .CustomerRef.name === y.DisplayName
                              ) {*/
                              return <option key={i}>{x.DisplayName}</option>;
                            })}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )
    );
  }
}
export default Application;

/**
 * 
          {this.state.newCardholder && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input placeholder="cardholder"></input>
            </form>
          )}
          <h3>
            My Cards{space}
            <span
              onClick={() =>
                this.setState({ newCardholder: !this.state.newCardholder })
              }
            >
              +
            </span>
          </h3>
          <table>
            <thead></thead>
            <tbody>
              {/*<tr>
                <td>Name</td>
                <td></td>
              </tr>* /}
              {this.state.cardholders.map((x, i) => {
                return (
                  <tr key={i}>
                    <td>
                      {x.individual.first_name}
                      <br />
                      {x.individual.last_name}
                    </td>
                    {/* <td>
                      {/*x.spending_controls.spending_limits.find(
                          (x) => x.interval === "weekly"
                        ).amount* /}
                    </td>
                    <td>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <input placeholder="authorize"></input>
                      </form>
                      </td>* /}
                    <td>
                      <div
                        onClick={() => {
                          var answer = window.confirm("Delete account?");
                          if (answer) {
                          }
                        }}
                      >
                        &times;
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3>
            My Balance{space}
            <span>+</span>
          </h3>
          <table>
            <thead></thead>
            <tbody>
              <tr>
                <td>$</td>
                <td>4444</td>
              </tr>
            </tbody>
          </table>
 */
