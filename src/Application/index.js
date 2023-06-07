import React from "react";
/*import {
  CardComponent,
  CardNumber,
  CardExpiry,
  CardCVV
} from "@chargebee/chargebee-js-react-wrapper";*/
import {
  CardElement,
  Elements,
  ElementsConsumer
} from "@stripe/react-stripe-js";

import { standardCatch } from "../Sudo";
import { PlaidLink } from "react-plaid-link";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc
} from "firebase/firestore";
import firebase from ".././init-firebase.js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  //"pk_test_51NFO1VHEkeca3H6eVJIo4umZBpLD7RLRZNr1Egh1ZzGRZg5fmDYRnawm4x65cr8JMusAgvrUx2C7MqHWZiEnWqMH00iAT6aJFd"
  "pk_live_51NFO1VHEkeca3H6ey7snMDyiG1YdbhrsgFE2xIHeYLUO87YNDlTFxqlxLDy1bDUvGoNWQwpiLuQ3QmR0reLtvpMr005LiIXtNB"
);
const firestore = getFirestore(firebase);

class Line extends React.Component {
  state = {
    chosenAccount: { Name: "accounts" },
    chosenCustomer: { DisplayName: "customers" },
    chosenVendor: { DisplayName: "customers" },
    chosenBank: { Name: "banks" }
  };
  render() {
    const { x } = this.props;
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
      <tr>
        <td>
          {!x.MetaData && (
            <div
              onClick={async () => {
                if (!this.state.chosenCustomer || !this.state.chosenAccount)
                  return window.alert("please choose a customer AND account");
                if (!this.props.user.subscriptionId) {
                  /*window.Chargebee.init({
                site: "quicknet",
                publishableKey:
                  "test_Rvan90hQVJaEGMV5QHAeJRd4Cc5OqHr2"
              });*/
                  var answer = window.confirm("Would you like to subscribe?");
                  if (answer) this.setState({ newSubscription: true });
                  return null;
                }
                if (!this.state.chosenVendor.Id)
                  return window.alert(
                    "You must select a vendor-entity from the dropdown menu."
                  );
                //purchase or delete from quickbooks
                const purchase = {
                  PaymentType: "CreditCard",
                  AccountRef: {
                    value: this.state.chosenBank.Id,
                    name: this.state.chosenBank.Name
                  },
                  Line: [
                    {
                      DetailType: "AccountBasedExpenseLineDetail",
                      Amount: x.amount,
                      AccountBasedExpenseLineDetail: {
                        AccountRef: {
                          value: this.state.chosenAccount.Id,
                          name: this.state.chosenAccount.Name
                        },
                        CustomerRef: {
                          value: this.state.chosenCustomer.Id,
                          name: this.state.chosenCustomer.DisplayName
                        }
                      }
                    }
                  ],
                  CurrencyRef: { value: "USD" },
                  EntityRef: {
                    value: this.state.chosenVendor.Id,
                    name: this.state.chosenVendor.DisplayName,
                    type: "Vendor"
                  }
                };
                await fetch(
                  "https://sea-turtle-app-cg9u4.ondigitalocean.app/addpurchase",
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
                      companyIDToken: this.props.selectedQuickbooks,
                      purchase
                    })
                  }
                ) //stripe account, not plaid access token payout yet
                  .then(async (res) => await res.json())
                  .then(async (result) => {
                    if (result.status) return console.log(result);
                    if (result.error) return console.log(result);
                    if (!result.transactions)
                      return console.log("dev error (Cash)", result);
                  });
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
                    x.Line[0].AccountBasedExpenseLineDetail.CustomerRef
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
            <select
              style={{ width: "80px" }}
              value={this.state.chosenVendor.DisplayName}
              onChange={(e) =>
                this.setState({
                  chosenVendor: x
                })
              }
            >
              {[{ DisplayName: name }, ...this.props.vendors].map((y, i) => {
                return <option key={i}>{y.DisplayName}</option>;
              })}
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
                  {x.AccountRef && x.AccountRef.name}
                </span>
              </div>
            </div>
          ) : (
            <select
              style={{ width: "80px" }}
              value={this.state.chosenBank.Name}
              onChange={(e) =>
                this.setState({
                  chosenBank: x
                })
              }
            >
              {[{ Name: "banks" }, ...this.props.banks].map((x, i) => (
                <option key={i}>{x.Name}</option>
              ))}
            </select>
          )}
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
                    x.Line[0].AccountBasedExpenseLineDetail.AccountRef &&
                    x.Line[0].AccountBasedExpenseLineDetail.AccountRef.name}
                </span>
              </div>
            </div>
          ) : (
            <select
              style={{ width: "80px" }}
              value={this.state.chosenAccount.Name}
              onChange={(e) =>
                this.setState({
                  chosenAccount: x
                })
              }
            >
              {[{ Name: "accounts" }, ...this.props.accounts].map((x, i) => (
                <option key={i}>{x.Name}</option>
              ))}
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
                    x.Line[0].AccountBasedExpenseLineDetail.CustomerRef &&
                    x.Line[0].AccountBasedExpenseLineDetail.CustomerRef.name}
                </span>
              </div>
            </div>
          ) : (
            <select
              style={{ width: "80px" }}
              value={this.state.chosenCustomer.DisplayName}
              onChange={(e) =>
                this.setState({
                  chosenCustomer: x
                })
              }
            >
              {[{ DisplayName: "customers" }, ...this.props.customers].map(
                (x, i) => {
                  /*if (
              !x.Line ||
              !x.Line[0].AccountBasedExpenseLineDetail
                .CustomerRef ||
              x.Line[0].AccountBasedExpenseLineDetail
                .CustomerRef.name === y.DisplayName
            ) {*/
                  return <option key={i}>{x.DisplayName}</option>;
                }
              )}
            </select>
          )}
        </td>
      </tr>
    );
  }
}

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
                  body: JSON.stringify({
                    subscriptionId: this.props.user.subscriptionId,
                    access_token: x
                  })
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
  constructor(props) {
    super(props);
    this.state = {
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
      date: new Date()
    };
  }
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

            const userData = await getDoc(
              doc(firestore, "userDatas", this.props.auth.uid)
            );
            (userData.exists() ? updateDoc : setDoc)(
              doc(firestore, "userDatas", this.props.auth.uid),
              {
                quickbooks: arrayUnion(result.companyIDToken)
              }
            ).then(() => {
              this.props.navigate("/");
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
    const quickbooks =
      this.props.user !== undefined &&
      this.props.user.quickbooks &&
      this.props.user.quickbooks.length > 0;
    return (
      this.props.auth !== undefined &&
      this.props.user !== undefined && (
        <div style={{ margin: 5 }}>
          <button
            onClick={async () => {
              const userData = await getDoc(
                doc(firestore, "userDatas", this.props.auth.uid)
              );
              (userData.exists() ? updateDoc : setDoc)(
                doc(firestore, "userDatas", this.props.auth.uid),
                {
                  quickbooks: []
                }
              );
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
          </button>

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
                            (x) =>
                              !["Expense", "Asset", "Revenue"].includes(
                                x.Classification
                              )
                          );
                          const vendors = JSON.parse(result.vendors.body);
                          const customers = JSON.parse(result.customers.body);
                          console.log(x, accounts, vendors, banks);
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
          {quickbooks &&
            //this.state.newSubscription &&
            !this.props.user.subscriptionId && (
              <Elements stripe={stripePromise}>
                <ElementsConsumer>
                  {({ stripe, elements }) => (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        //this.cardRef.current.tokenize().then((data) =>
                        //{console.log("chargebee token", data.token);});
                        const { email, name } = this.state,
                          paymentMethod = await stripe.createPaymentMethod({
                            type: "card",
                            card: elements.getElement(CardElement),
                            billing_details: {
                              name,
                              email
                            }
                          });
                        //https://www.mohammadfaisal.dev/blog/how-to-create-a-stripe-subscription-with-reactjs-and-nodejs
                        await fetch(
                          "http://sea-turtle-app-cg9u4.ondigitalocean.app/subscribe",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              paymentMethod: paymentMethod.paymentMethod.id,
                              name,
                              email,
                              priceId: "price_1NFOFLHEkeca3H6etn9uECwV"
                            })
                          }
                        )
                          .then((res) => res.json())
                          .then(async (response) => {
                            const confirmPayment = await stripe.confirmCardPayment(
                              response.clientSecret
                            );

                            if (confirmPayment.error) {
                              console.log(confirmPayment.error.message);
                            } else {
                              updateDoc(
                                doc(
                                  firestore,
                                  "userDatas",
                                  this.props.auth.uid
                                ),
                                {
                                  subscriptionId: response.subscription
                                }
                              );
                              window.alert(
                                "Success! Check your email for the invoice. " +
                                  "You can now add QuickBooks purchases through QuickNet."
                              );
                            }
                          });
                      }}
                      style={{
                        maxWidth: "360px"
                      }}
                    >
                      {/*<CardComponent
                          style={{ width: "100%" }}
                          ref={this.cardRef}
                          onChange={this.onChange}
                        >
                          <CardNumber />
                          <CardExpiry />
                          <CardCVV />
                        </CardComponent>*/}
                      <CardElement stripe={stripe} elements={elements} />
                      <input
                        placeholder="Name"
                        type="text"
                        value={this.state.name}
                        onChange={(e) =>
                          this.setState({ name: e.target.value })
                        }
                      />
                      $40 per month
                      <br />
                      <input
                        placeholder="Email"
                        type="text"
                        value={this.state.email}
                        onChange={(e) =>
                          this.setState({ email: e.target.value })
                        }
                      />
                      <button type="submit">Submit</button>
                    </form>
                  )}
                </ElementsConsumer>
              </Elements>
            )}
          {!quickbooks ? null : this.state.plaid_link ? (
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
                    body: JSON.stringify({
                      subscriptionId: this.props.user.subscriptionId,
                      public_token: publicToken
                    })
                  }
                ) //stripe account, not plaid access token payout yet
                  .then(async (res) => await res.json())
                  .then(async (result) => {
                    if (result.status) return console.log(result);
                    if (result.error) return console.log(result);
                    if (!result.access_token)
                      return console.log("dev error (Cash)", result);
                    console.log("access_token", result.access_token);
                    const userData = await getDoc(
                      doc(firestore, "userDatas", this.props.auth.uid)
                    );
                    (userData.exists() ? updateDoc : setDoc)(
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
              {!this.props.user.subscriptionId ? (
                <i>
                  Sign into any bank with 'user_good', 'pass_good', and any SMS
                  code.
                </i>
              ) : (
                "Load bank plaidTransactions"
              )}
            </PlaidLink>
          ) : (
            <button
              style={{ margin: "4px 0px" }}
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
                    body: JSON.stringify({
                      subscriptionId: this.props.user.subscriptionId
                    })
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
              {!this.props.user.subscriptionId
                ? "Use a sample bank account to proceed"
                : "Connect your bank account"}
            </button>
          )}
          {quickbooks && (
            <form onSubmit={(e) => e.preventDefault()}>
              {this.props.user !== undefined &&
                this.props.user.accessTokens &&
                this.props.user.accessTokens.map((x, i) => {
                  return (
                    <Account
                      x={x}
                      key={i}
                      auth={this.props.auth}
                      user={this.props.user}
                      listTransactions={async (x) => {
                        this.setState({ selectedItem: x });
                      }}
                      selectedItem={this.state.selectedItem}
                    />
                  );
                })}
            </form>
          )}
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
                  date: new Date(this.state.date.getTime() - 2629800000)
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
                  new Date(this.state.date.getTime() + 1329800000) < new Date()
                )
                  this.setState({
                    date: new Date(this.state.date.getTime() + 2629800000)
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
                      subscriptionId: this.props.user.subscriptionId,
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
                  return (
                    <Line
                      key={i}
                      x={x}
                      selectedQuickbooks={this.state.selectedQuickbooks}
                      user={this.props.user}
                      accounts={this.state.accounts}
                      vendors={this.state.vendors}
                      customers={this.state.customers}
                      banks={this.state.banks}
                    />
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
