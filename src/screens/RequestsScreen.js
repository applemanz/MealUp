import React from 'react';
import { View, Button, Text, FlatList, Modal, TouchableHighlight, Image } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';
// import { userName, userID } from '../screens/SignInScreen';

import firebase from "../config/firebase";
const userID = '10210889686788547'
const userName = 'Andrew Zeng'
const db = firebase.firestore();

const ComponentCenter = () => {
  return(
    <View style={{ flex: 1, alignItems: 'center'}}>
       <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Requests</Text>
    </View>
  );
};

export default class RequestsScreen extends React.Component {
  static navigationOptions = {
    title: 'Requests',
  };

  constructor(props) {
    super(props);
    this.state = {modalVisible: false, index: 1, sentRequests: [], receivedRequests: [], respondVisible: false, curUser: {}, undoVisible: false};
    this.updateIndex = this.updateIndex.bind(this);
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
        querySnapshot.forEach(function(doc) {
            requestS.push({name: doc.data().FriendName, url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`, id: doc.data().FriendID,
                           DateTime: doc.data().DateTime, Location: doc.data().Location, docID: doc.id})
        });
        this.setState({sentRequests: requestS});
    });
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
        querySnapshot.forEach(function(doc) {
            requestR.push({name: doc.data().FriendName, url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`, id: doc.data().FriendID,
                           DateTime: doc.data().DateTime, Location: doc.data().Location, docID: doc.id})
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

  renderItem = ({item, index}) => {
    return <ListItem key={item.key} title={item.key}/>;
  }

  renderSentRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.name}
    subtitle={item.DateTime + " at " + item.Location}
    avatar={{uri:item.url}}
    onPress={() => this._onPressSent(item)}
    />;
  }

  renderReceivedRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.name}
    subtitle={item.DateTime + " at " + item.Location}
    avatar={{uri:item.url}}
    onPress={() => this._onPressReceived(item)}
    />;
  }

  _keyExtractor = (item, index) => item.name + item.DateTime;
  _onPressSent = (item) => {
    this.setState({undoVisible: true, curUser: {name: item.name, id: item.id,
      DateTime: item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),
      Location: item.Location, docID: item.docID, DateObj: item.DateTime}});
  }
  _onPressReceived = (item) => {
    this.setState({respondVisible: true, curUser: {name: item.name, id: item.id,
      DateTime: item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),
      Location: item.Location, docID: item.docID,  DateObj: item.DateTime}});
  }

  updateIndex = (index) => {
    this.setState({index})
  }

  renderBottom() {
    if (this.state.index == 0)
        return <FlatList keyExtractor={this._keyExtractor}
          data={this.state.sentRequests}
          renderItem={this.renderSentRequest}
        />;
    return <FlatList keyExtractor={this._keyExtractor}
      data={this.state.receivedRequests}
      renderItem={this.renderReceivedRequest}
    />;
  }

  respondModal() {
    return <View style={{flex: 1}}>
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
        <Text>{this.state.curUser.name}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.DateTime} at {this.state.curUser.Location}</Text>
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
            onPress={this.declineRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Decline</Text>
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

  acceptRequest = () => {
    // put document in meals
    console.log(this.state.curUser.docID)
    data = new Object()
    data['Day'] = this.state.curUser.DateObj
    data['FriendID'] = this.state.curUser.id
    data['FriendName'] = this.state.curUser.name
    data['Length'] = 0.5
    data['Location'] = this.state.curUser.Location
    db.collection("users").doc(userID).collection('Meals').add(data)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            data['FriendName'] = userName
            data['FriendID'] = userID
            db.collection("users").doc(this.state.curUser.id).collection('Meals').doc(docRef.id).set(data)
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    // remove document from requests
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.id).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  declineRequest = () => {
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.id).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  undoRequest = () => {
    db.collection("users").doc(userID).collection('Sent Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.id).collection('Received Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({undoVisible: false})
  }

  rescheduleRequest = () => {
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.id).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
    this.props.navigation.navigate('FriendChosen', {
      name: this.state.curUser.name,
      id: this.state.curUser.id,
      url: `http://graph.facebook.com/${this.state.curUser.id}/picture?type=square`
    });
  }

  undoModal() {
    return <View style={{flex: 1}}>
    <Modal transparent={true} visible={this.state.undoVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 350,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.curUser.id}/picture?type=large`}}
        />
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.name}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.DateTime} at {this.state.curUser.Location}</Text>
        </View>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.undoRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Undo Request</Text>
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

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar componentCenter   =     {<ComponentCenter />}
                       componentRight    =     {<View style={{ flex: 1, alignItems: 'center'}}>
                       <TouchableHighlight underlayColor='transparent' style={{padding: 20}} onPress={() => this.setState({modalVisible: true})}><Text style={{fontSize: 30, fontWeight: 'bold', color: 'white'}}>+</Text></TouchableHighlight>
                    </View>}/>
        <ButtonGroup
        onPress={this.updateIndex}
        selectedIndex={this.state.index}
        buttons={['Sent', 'Received']}
        containerStyle={{height: 30}} />

        {this.renderBottom()}
        <View style={{flex: 1}}>
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
      </View>

      {this.respondModal()}
      {this.undoModal()}

    </View>
    );
  }
}
