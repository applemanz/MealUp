import React from 'react';
import { View, Button, Text, FlatList, Modal, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';

import firebase from "../config/firebase";
const userID = '10210889686788547'
const db = firebase.firestore();

const ComponentCenter = () => {
  return(
    <View style={{ flex: 1, }}>
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
    this.state = {modalVisible: false, index: 1, sentRequests: [], receivedRequests: []};
    this.updateIndex = this.updateIndex.bind(this);
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
        querySnapshot.forEach(function(doc) {
            requestS.push({name: doc.data().FriendName, url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`, id: doc.data().FriendID,
                           DateTime: doc.data().DateTime, Location: doc.data().Location})
        });
        this.setState({sentRequests: requestS});
    });
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
        querySnapshot.forEach(function(doc) {
            requestR.push({name: doc.data().FriendName, url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=square`, id: doc.data().FriendID,
                           DateTime: doc.data().DateTime, Location: doc.data().Location})
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

  renderRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.name}
    subtitle={item.DateTime + " at " + item.Location}
    avatar={{uri:item.url}}
    onPress={() => this._onPress(item.name,item.id, item.url)}
    />;
  }

  _keyExtractor = (item, index) => item.name + item.DateTime;
  _onPress = (name, id, url) => {
    
  }

  setModalVisible = () => {
    this.setState({modalVisible: true});
  }

  setModalInvisible = () => {
    this.setState({modalVisible: false});
  }

  updateIndex = (index) => {
    this.setState({index})
  }

  renderBottom() {
    if (this.state.index == 0)
        return <FlatList keyExtractor={this._keyExtractor}
          data={this.state.sentRequests}
          renderItem={this.renderRequest}
        />;
    return <FlatList keyExtractor={this._keyExtractor}
      data={this.state.receivedRequests}
      renderItem={this.renderRequest}
    />;
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar componentCenter   =     {<ComponentCenter />}
                       componentRight    =     {<View style={{ flex: 1, alignItems: 'center'}}>
                       <TouchableHighlight onPress={this.setModalVisible}><Text style={{fontSize: 30, fontWeight: 'bold', color: 'white'}}>+</Text></TouchableHighlight>
                    </View>}/>
        <ButtonGroup
        onPress={this.updateIndex}
        selectedIndex={this.state.index}
        buttons={['Sent', 'Received']}
        containerStyle={{height: 30}} />

        {this.renderBottom()}
        <View style={{flex: 1}}>
     <Modal
          transparent={true}
          visible={this.state.modalVisible}
          >
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
              <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD"}}
                onPress={this.setModalInvisible}>
                <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
              </TouchableHighlight>
            </View>
            </View>
            </View>
        </Modal>
      </View>

    </View>
    );
  }
}
