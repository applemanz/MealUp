import React from 'react';
import { View, Button, Text, FlatList, Modal, TouchableHighlight, Image } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';
import HeaderButtons from 'react-navigation-header-buttons'
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import { userName, userID } from '../screens/SignInScreen';
import firebase from "../config/firebase";

const db = firebase.firestore();

export default class RequestsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Requests',
        headerRight: (
          <HeaderButtons IconComponent={Ionicons} iconSize={23} color="white">
            <HeaderButtons.Item title="add" iconName="md-add-circle" onPress={params.showModal} />
          </HeaderButtons>
        ),
      };
    };

  componentWillMount() {
    this.props.navigation.setParams({ showModal: this.showModal });
  }

  state = {modalVisible: false, index: 1, sentRequests: [], receivedRequests: [], respondVisible: false, curUser: {}, undoVisible: false,
  refreshingR: false, refreshingS: false};


  showModal = () => {
    this.setState({modalVisible: true})
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestS.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString
          })
        } else {
          console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Sent Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Received Requests').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
        this.setState({sentRequests: requestS});
    });
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestR.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString
          })
        } else {
          console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Received Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Sent Requests').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
        this.setState({receivedRequests: requestR});
    });
  }

  RequestByFriend = () => {
    this.setState({modalVisible: false});
    this.props.navigation.navigate('RequestByFriend');
  }

  RequestByTime = () => {
    this.setState({modalVisible: false});
    this.props.navigation.navigate('RequestByTime');
  }

  // renderItem = ({item, index}) => {
  //   return <ListItem key={item.key} title={item.key}/>;
  // }

  renderSentRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.FriendName}
    subtitle={item.TimeString + " at " + item.Location}
    avatar={{uri:item.url}}
    onPress={() => this._onPressSent(item)}
    />;
  }

  renderReceivedRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.FriendName}
    subtitle={item.TimeString + " at " + item.Location}
    avatar={{uri:item.url}}
    onPress={() => this._onPressReceived(item)}
    />;
  }

  _keyExtractor = (item, index) => item.docID;

  _onPressSent = (item) => {
    this.setState({
      undoVisible: true,
      curUser: {
        FriendName: item.FriendName,
        FriendID: item.FriendID,
        TimeString: item.TimeString,
        Location: item.Location,
        Length: item.Length,
        docID: item.docID,
        DateTime: item.DateTime}});
  }
  // item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),

  _onPressReceived = (item) => {
    this.setState({
      respondVisible: true,
      curUser: {
        FriendName: item.FriendName,
        FriendID: item.FriendID,
        TimeString: item.TimeString,
        Location: item.Location,
        docID: item.docID,
        Length: item.Length,
        DateTime: item.DateTime}});
  }
  //item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),

  acceptRequest = () => {
    // put document in meals
    console.log(this.state.curUser.docID)
    data = new Object()
    data['DateTime'] = this.state.curUser.DateTime
    data['FriendID'] = this.state.curUser.FriendID
    data['FriendName'] = this.state.curUser.FriendName
    data['Length'] = this.state.curUser.Length
    data['Location'] = this.state.curUser.Location
    data['TimeString'] = this.state.curUser.TimeString
    db.collection("users").doc(userID).collection('Meals').add(data)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            data['FriendName'] = userName
            data['FriendID'] = userID
            db.collection("users").doc(this.state.curUser.FriendID).collection('Meals').doc(docRef.id).set(data)
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    // remove document from requests
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.FriendID).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  ignoreRequest = () => {
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      // db.collection("users").doc(this.state.curUser.id).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  cancelRequest = () => {
    db.collection("users").doc(userID).collection('Sent Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.FriendID).collection('Received Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({undoVisible: false})
  }

  rescheduleRequest = () => {
    this.setState({respondVisible: false})
    this.props.navigation.navigate('FriendChosen', {
      sent: false,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      id: this.state.curUser.FriendID,
      url: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`
    });
  }

  rescheduleSentRequest = () => {
    this.setState({undoVisible: false})
    this.props.navigation.navigate('FriendChosen', {
      sent: true,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      id: this.state.curUser.FriendID,
      url: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`
    });
  }
  refreshReceived = () => {
    this.setState({refreshingR: true});
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().DateTime >= new Date()) {
            requestR.push({
              FriendName: doc.data().FriendName,
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString
            })
          } else {
            console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
            db.collection("users").doc(userID).collection('Received Requests').doc(doc.id).delete().then(() => {
              console.log("Document successfully deleted!");
              db.collection("users").doc(doc.data().FriendID).collection('Sent Requests').doc(doc.id).delete()
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          }
        });
        this.setState({receivedRequests: requestR});
    });
    this.setState({refreshingR: false});
  }

  refreshSent = () => {
    this.setState({refreshingS: true});
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().DateTime >= new Date()) {
            requestS.push({
              FriendName: doc.data().FriendName,
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString
            })
          } else {
            console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
            db.collection("users").doc(userID).collection('Sent Requests').doc(doc.id).delete().then(() => {
              console.log("Document successfully deleted!");
              db.collection("users").doc(doc.data().FriendID).collection('Received Requests').doc(doc.id).delete()
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          }
        });
        this.setState({sentRequests: requestS});
    });
    this.setState({refreshingS: false});
  }

  render() {
    return (
      <View style={{flex:1}}>
        <ScrollableTabView
          style={{marginTop: 0}}
          renderTabBar={() => <DefaultTabBar />}
          // onChangeTab = {(i, ref) => {this.setState({onFriends: !this.state.onFriends})}}
          tabBarBackgroundColor = {'#f4511e'}
          tabBarActiveTextColor = {'white'}
          tabBarInactiveTextColor = {'black'}
          tabBarUnderlineStyle = {{backgroundColor:'white'}}
        >
          <FlatList
            refreshing={this.state.refreshingR}
            onRefresh={this.refreshReceived}
            tabLabel='Received'
            keyExtractor={this._keyExtractor}
            data={this.state.receivedRequests}
            renderItem={this.renderReceivedRequest}
          />
          <FlatList
            refreshing={this.state.refreshingS}
            onRefresh={this.refreshSent}
            tabLabel='Sent'
            keyExtractor={this._keyExtractor}
            data={this.state.sentRequests}
            renderItem={this.renderSentRequest}
          />
        </ScrollableTabView>
          {this.requestModal()}
          {this.respondModal()}
          {this.undoModal()}
      </View>
    );
  }
  requestModal() {
    return <View>
    <Modal transparent={true} visible={this.state.modalVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
        <View style={{
          width: 300,
          height: 300,
          backgroundColor: '#fff', padding: 20}}>
          <View style={{padding: 15}}>
            <Button onPress={this.RequestByFriend} title="Request by Friend"/>
          </View>
          <View style={{padding: 15}}>
            <Button onPress = {this.RequestByTime} title="Request by Time"/>
          </View>
          <View style={{padding: 25, alignItems: 'center'}}>
            <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
              onPress={() => this.setState({modalVisible: false})}>
              <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </Modal>
  </View>;
  }

  undoModal() {
    return <View>
    <Modal transparent={true} visible={this.state.undoVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 400,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`}}
        />
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.FriendName}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        </View>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.cancelRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Request</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleSentRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 15, alignItems: 'center'}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
            onPress={() => this.setState({undoVisible: false})}>
            <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
          </TouchableHighlight>
        </View>
        </View>
        </View>
    </Modal>
  </View>;
  }

  respondModal() {
    return <View>
    <Modal transparent={true} visible={this.state.respondVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 460,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.curUser.id}/picture?type=large`}}
        />
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.FriendName}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        </View>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5cb85c", borderRadius: 5}}
            onPress={this.acceptRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Accept</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.ignoreRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Ignore</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 15, alignItems: 'center'}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
            onPress={() => this.setState({respondVisible: false})}>
            <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
          </TouchableHighlight>
        </View>
        </View>
        </View>
    </Modal>
  </View>;
}
}
