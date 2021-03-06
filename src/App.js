import { useEffect, useState, MainComponent } from "react";
import Main from "./component/Main";
import {
  BrowserRouter,
  Redirect,
  Link,
  Route,
  useHistory,
  Switch,
  Router,
} from "react-router-dom";
import Web3 from "web3";
import { useSelector, useDispatch } from "react-redux";
import { currentRefralid } from "./redux/sellerReducer";
import Dashboard from "./component/Dashboard/Index";
import moment from "moment";
import ViewUserProfile from "./component/viewUserProfile/Index";


function App(props) {
  const [contract, setContract] = useState();
  const [usdtContract, setBusdContract] = useState();
  const [account, setAccount] = useState("");
  const [earnBusd, setEarnBusd] = useState();
  const [curentregId, setCurentregId] = useState();
  const [idinput, setIdinput] = useState(false);
  const [chagroute, setChagroute] = useState(false);
  const [reguserId, setReguserId] = useState({});
  const [userdata, setUserdata] = useState({});
  const [viewuserdata, setViewUserdata] = useState({});
  const [Joiningdate, setJoiningDate] = useState();
  const [chailddata, setChaildata] = useState([]);
  const [chaildaddr, setChailaddr] = useState([]);
  var referrer_ID = 1;

  if (window.location.href.includes("invite")) {
    referrer_ID = window.location.href.split("/")[3].split(':')[1];
  }

  const dispatch = useDispatch();
  // =======user inputRefralid  throw refrrer link=======
  const inputRefralid = useSelector((state) => state.userslice.inputRefralid);
  // ========this is registration button addres=======
  const curretwallet = useSelector((state) => state.userslice.userId);

  const userapprove = useSelector((state) => state.userslice.userapprove);

  useEffect(() => {
    getCurrentId();
  });
  // useEffect(() => {
  //   viewingData();
  // });
  useEffect(() => {
    if (userapprove === "approve") {
      approve();
    }
  }, [userapprove]);

  useEffect(() => {
    if (account) {
      user(account);
    }
  }, [account]);

  useEffect(() => {
    load();
    loadContract();
    getCreateDate();
    getUserReferral();
  }, [account]);

  useEffect(() => {
    chailAddressData();
  }, [chaildaddr]);
  useEffect(() => {
    totalEarningUSDT();
  }, [contract, account, userdata]);

  // .....this is access current account on load
  const loadWeb3 = async () => {
    console.log("account of fresh", account);
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      let account = await window.web3.eth.getAccounts();
      setAccount(account[0]);
    } else {
      alert(
        `wallet Not found!! Pleas Download Metamask "\n
        METAMASK WALLET\n
         https://metamask.io/download \n
        TRUST WALLET\n
         https://trustwallet.com/download-page/ `
      );
    }
  };

  const load = async () => {
    await loadWeb3();

    // console.log("lol" ,window.location);
    // window.location = window.location.origin;
  };

  const getCurrentId = async () => {
    if (contract) {
      //calling block chain function
      let currentID = await contract.methods.currentId().call();
      setCurentregId(currentID);
      await dispatch(currentRefralid(currentID));
    }
  };

  const getUserReferral = async () => {
    if (account) {
      let ref = await contract.methods.viewUserReferral(account).call();
      console.log("user refferral is ,,,,. ----------->", ref);
      setChailaddr((pre) => [...pre, ref[0], ref[1]]);
    }
  };
  // ======user call with current wallet Address==== and return Id====
  const user = async () => {
    if (account) {
      const data = await contract.methods.users(account).call();
      setUserdata(data);
      const { isExist, id, referrerID, currentLevel, totalEarningUSDT } = data;

      setReguserId(id);
      if (isExist === true) {
        // alert("user is alre registred");
        setChagroute(true);
      }
    } else {
    }
  };
  const chailAddressData = async () => {
    setChaildata([]);
    if (chaildaddr[0]) {
      const child1 = await contract.methods.users(chaildaddr[0]).call();
      setChaildata((pre) => [...pre, child1]);
    }
    if (chaildaddr[1]) {
      const child2 = await contract.methods.users(chaildaddr[1]).call();
      setChaildata((pre) => [...pre, child2]);
    }
  };

  const registerUser = async (v, id) => {
    console.log("View data", id);
    if (v) {
      const address = await contract.methods.userList(id).call();
      console.log("address", address);
      const data = await contract.methods.users(address).call();
      console.log("data", data);
      setViewUserdata(data);
    } 
    else if (referrer_ID) {
      const userregister = await contract.methods
      .regUser(referrer_ID)
      .send({ from: account });
      setChagroute(true);
     
    }
    else {
      const userregister = await contract.methods
        .regUser(id)
        .send({ from: account });
      setChagroute(true);
    }
  };

  const approve = async () => {
    let approveData = await usdtContract.methods
      .approve(
        "0x38cC0003E3E7e8Ba90396F2EF09CB0Bf03A95C05",
        "1000000000000000000000000"
      )
      .send({ from: account });
  };
  const totalEarningUSDT = async () => {
    let sum = 0;
    if (contract && account) {
      const data = await contract.methods.users(account).call();
      setEarnBusd(data.totalEarningBUSD/1000000000000000000);
      // debugger;
      // for (let i = 1; i <= 8; i++) {
      //   // debugger;
      //   let earning = await window.web3.utils.fromWei(
      //     await contract.methods.EarnedBusd(account, i).call()
      //   );
      //   // console.log("earn usdt is ---->", i, earning);
      //   sum = sum + Number(earning);
      // }
      // set earning busd in line 191
      // setEarnBusd(sum);
      // console.log("sum is", sum);
    }
  };
  const getCreateDate = async () => {
    if (account) {
      // debugger;
      let date = await contract.methods.createdDate(account).call();
      console.log("date joining", date);
      let epochValue = moment.unix(date).utc()._d.toString();
      console.log("date is get  created----->", moment.unix(date).utc()._d);
      console.log("epochValue....................", epochValue)
      // set exastngeting date in line 202
      setJoiningDate(epochValue);
    }
  };

  const buyLevels = async (levelNo) => {
    await contract.methods.buyLevel(levelNo).send({ from: account });
    window.location.reload();
  };

  const loadContract = async () => {
    let ABI = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "UserAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "Levelno", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "Time", "type": "uint256" }], "name": "buyLevelEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "UserAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "UserId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "ReferrerAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "ReferrerId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "Levelno", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "LevelPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "Time", "type": "uint256" }], "name": "getMoneyForLevelEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "UserAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "UserId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "ReferrerAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "ReferrerId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "Levelno", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "LevelPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "Time", "type": "uint256" }], "name": "lostMoneyForLevelEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "UserAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "ReferrerAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "Time", "type": "uint256" }], "name": "regLevelEvent", "type": "event" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "EarnedBusd", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "LEVEL_PRICE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERIOD_LENGTH", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "adminFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_level", "type": "uint256" }], "name": "buyLevel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "createdDate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "currentId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "_userAddress", "type": "address" }], "name": "findFreeReferrer", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getTotalEarnedBUSD", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "loopCheck", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ownerAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_referrerID", "type": "uint256" }], "name": "regUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_adminFee", "type": "uint256" }], "name": "updateFeePercentage", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_level", "type": "uint256" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }], "name": "updatePrice", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "userList", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "bool", "name": "isExist", "type": "bool" }, { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "uint256", "name": "referrerID", "type": "uint256" }, { "internalType": "uint256", "name": "currentLevel", "type": "uint256" }, { "internalType": "uint256", "name": "totalEarningBUSD", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "_userAddress", "type": "address" }], "name": "viewUserReferral", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }]
    const contract = await new window.web3.eth.Contract(
      ABI,
      "0x38cC0003E3E7e8Ba90396F2EF09CB0Bf03A95C05"
    );

    let BusdABI = [
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        constant: true,
        inputs: [],
        name: "_decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "_name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "_symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedValue", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "getOwner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "mint",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const USDTcontract = await new window.web3.eth.Contract(
      BusdABI,
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
    );
    setContract(contract);
    setBusdContract(USDTcontract);
    // console.log("contract", contract);
    // console.log("USDT contract-------", usdtContract);
  };

  // window.location = window.location.origin;

  return (
    <div className="App">
      <BrowserRouter>
        <Route
          path="/"
          exact
          component={() => (
            <Main
              account={account}
              idinput={idinput}
              chagngeroute={chagroute}
              registerUser={registerUser}
            />
          )}
        />
        <Route
          path="/invite:referrer_ID"
          exact
          component={() => (
            <Main
              account={account}
              idinput={idinput}
              chagngeroute={chagroute}
              registerUser={registerUser}
              referrerID={referrer_ID}
            />
          )}
        />
        <Route
          path="/dashboard"
          component={() => (
            <Dashboard
              // reguserId={reguserId}
              getCurrentId={getCurrentId}
              approve={approve}
              user={user}
              earnBusd={earnBusd}
              account={account}
              buyLevel={buyLevels}
              // loadContract={loadContract}
              contract={contract}
              userdata={userdata}
              chailddata={chailddata}
              Joiningdate={Joiningdate}
            />
          )}
        />
        <Route
          path="/visitorDashboard"
          component={() => (
            <ViewUserProfile
              viewuserdata={viewuserdata}
              chailddata={chailddata}
              userdata={userdata}
            />
          )}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
