import React from 'react';
import { View, Button, Text, SectionList, Modal, TouchableHighlight, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import HeaderButtons from 'react-navigation-header-buttons'
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import { userName, userID } from '../screens/SignInScreen';
import firebase from "../config/firebase";

const db = firebase.firestore();

const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24, '8:00 PM': 25, '8:30 PM': 26, '9:00 PM': 27, '9:30 PM': 28}
const weekdays = [
{key:0, day:'Sunday'}, {key:1, day:'Monday'}, {key:2, day:'Tuesday'}, {key:3, day:'Wednesday'}, {key:4, day:'Thursday'},
{key:5, day:'Friday'}, {key:6, day:'Saturday'}
]

export default class RequestsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Requests',
        headerRight: (
          <HeaderButtons IconComponent={Ionicons} iconSize={23} color="white">
            <HeaderButtons.Item title="add" iconName="md-add-circle" onPress={params.showNewRequestModal} />
          </HeaderButtons>
        ),
      };
    };
  showNewRequestModal = () => {
    this.setState({newRequestModalVisible: true})
  }
  RequestByFriend = () => {
    this.setState({newRequestModalVisible: false});
    this.props.navigation.navigate('RequestByFriend');
  }
  RequestByTime = () => {
    this.setState({newRequestModalVisible: false});
    this.props.navigation.navigate('RequestByTime');
  }

  state = {
      newRequestModalVisible: false,
      index: 1,
      respondVisible: false,
      curUser: {},
      undoVisible: false,
      refreshingR: false,
      refreshingS: false,
      respondGroupReceived:false,
      respondGroupSent: false,
      acceptedGroupReceived: false
    }

  componentWillMount() {
    this.props.navigation.setParams({ showNewRequestModal: this.showNewRequestModal });
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestS.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString,
            conflict: doc.data().conflict
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
      requestS.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      });
        this.setState({sentRequests: requestS});
    });
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestR.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString,
            conflict: doc.data().conflict
          })
        } else {
          // console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Received Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Sent Requests').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
      requestR.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      });
        this.setState({receivedRequests: requestR});
    });
    db.collection("users").doc(userID).collection('Received Group Requests').onSnapshot((querySnapshot) => {
      groupRequestR = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          data = doc.data()
          data['id'] = doc.id
          console.log('meal declined')
          console.log(data.declined)
          if (!data.members[userID].declined)
            groupRequestR.push(data)
        } else {
          // console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Received Group Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      })
      groupRequestR.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      })
        this.setState({receivedGroupRequests: groupRequestR});
    })
    db.collection("users").doc(userID).collection('Sent Group Requests').onSnapshot((querySnapshot) => {
      sentGroupRequests = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data()
        // not expired request
        if (doc.data().DateTime >= new Date()) {
          totalCount = Object.keys(data.members).length
          acceptedCount = 0
          for (memberID in data.members) {
            if (data.members[memberID].accepted == true) {
              acceptedCount++
            }
          }
          // auotmatically schedule meal if everyone has accepted
          if (acceptedCount == totalCount) {
            data.isGroup = true
            // Add to Meals
            db.collection("users").doc(userID).collection('Meals').add(data).then((docRef) => {
              for (memberID in data.members) {
                if (memberID != userID) {
                  db.collection("users").doc(memberID).collection('Meals').doc(docRef.id).set(data)
                }
              }
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            })

            // Delete request
            db.collection("users").doc(userID).collection('Sent Group Requests').doc(doc.id).delete().then(() =>{
              for (memberID in data.members) {
                if (memberID != userID)
                  db.collection("users").doc(memberID).collection('Received Group Requests').doc(doc.id).delete()
              }
            })
            .catch(function(error) {
              console.error("Error removing document: ", error);
            })

            // TODO Send notification

          }
          else {
            data['id'] = doc.id
            sentGroupRequests.push(data)
          }
        }
        // expired request
        else {
          day = weekdays[data['DateTime'].getDay()].day
          amPM = data['DateTime'].getHours() >= 12 ? "PM" : "AM"
          hours = (data['DateTime'].getHours() % 12 || 12) + ":" + ("0" + data['DateTime'].getMinutes()).slice(-2) + " " + amPM
          index = data_flip[hours]
          db.collection("users").doc(userID).collection('Sent Group Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            for (memberID in data.members) {
              if (data.members[memberID].accepted == true) {
                freetimeRef = db.collection("users").doc(memberID).collection('Freetime').doc(day);
                freetimeRef.get().then((doc) => {
                  freetimeData = doc.data();
                  freetimeData['Freetime'][index] = 1
                  if (data['Length'] === 1) {
                    freetimeData['Freetime'][index+1] = 1
                  }
                freetimeRef.set(freetimeData).then(() => {
                  console.log("My Document updated");
                  })
                  .catch(function(error) {
                    console.error("Error updating", error);
                  })
                })
              }
            }
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          })
        }
      })

      sentGroupRequests.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      })
        this.setState({sentGroupRequests: sentGroupRequests});
    })
  }

  refreshReceived = () => {
    this.setState({refreshingR: true});
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().DateTime >= new Date()) {
            requestR.push({
              FriendName: doc.data().FriendName,
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString,
              conflict: doc.data().conflict
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
        requestR.sort(function(a, b) {
          a = a.DateTime;
          b = b.DateTime;
          return a>b ? 1 : a<b ? -1 : 0;
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
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString,
              conflict: doc.data().conflict
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
        requestS.sort(function(a, b) {
          a = a.DateTime;
          b = b.DateTime;
          return a>b ? 1 : a<b ? -1 : 0;
        });
        this.setState({sentRequests: requestS});
    });
    this.setState({refreshingS: false});
  }

  render() {
    if (this.state.receivedRequests && this.state.sentRequests && this.state.receivedGroupRequests && this.state.sentGroupRequests) {
      receivedLen = this.state.receivedRequests.length
      sentLen = this.state.sentRequests.length
      receivedGroupLen = this.state.receivedGroupRequests.length
      sentGroupLen = this.state.sentGroupRequests.length
    if (receivedLen === 0 && receivedGroupLen === 0 && sentLen === 0 && sentGroupLen === 0) {
        console.log("no requests sent or received");
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
              <SectionList
                tabLabel='Received'
                onRefresh={this.refreshReceived}
                refreshing={this.state.refreshingR}
                renderItem={this.renderReceivedRequest}
                ListFooterComponent={<Text style={{textAlign: 'center', padding: 30}}>You have not received requests from friends for this week.</Text>}
                sections={[]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
              <SectionList
                tabLabel='Sent'
                renderItem={this.renderSentRequest}
                onRefresh={this.refreshSent}
                refreshing={this.state.refreshingS}
                ListFooterComponent={<Text style={{textAlign: 'center', padding: 30}}>It feels a bit empty in here. Tap on the plus button to send meal requests to your friends!</Text>}
                sections={[]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
            </ScrollableTabView>
          {this.requestModal()}
          {this.respondModal()}
          {this.undoModal()}
          {this.receivedGroupRequestModal()}
          {this.sentGroupRequestModal()}
          {this.acceptedGroupRequestModal()}
          </View>
          )
      } else if (receivedLen === 0 && receivedGroupLen === 0) {
        console.log("no requests received");
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
              <SectionList
                tabLabel='Received'
                onRefresh={this.refreshReceived}
                refreshing={this.state.refreshingR}
                renderItem={this.renderReceivedRequest}
                ListFooterComponent={<Text style={{textAlign: 'center', padding: 30}}>You have not received requests from friends for this week.</Text>}
                sections={[]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
              <SectionList
                tabLabel='Sent'
                renderItem={this.renderSentRequest}
                onRefresh={this.refreshSent}
                refreshing={this.state.refreshingS}
                sections={[
                  { title: 'Groups', data: this.state.sentGroupRequests, renderItem: this.renderSentGroupRequest },
                  { title: 'Friends', data: this.state.sentRequests },
                ]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
            </ScrollableTabView>
              {this.requestModal()}
              {this.respondModal()}
              {this.undoModal()}
              {this.receivedGroupRequestModal()}
              {this.sentGroupRequestModal()}
              {this.acceptedGroupRequestModal()}
          </View>
          )
      } else if (sentLen === 0 && sentGroupLen === 0) {
        console.log("no requests sent");
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
              <SectionList
                tabLabel='Received'
                onRefresh={this.refreshReceived}
                refreshing={this.state.refreshingR}
                renderItem={this.renderReceivedRequest}
                sections={[
                  { title: 'Groups', data: this.state.receivedGroupRequests, renderItem: this.renderReceivedGroupRequest },
                  { title: 'Friends', data: this.state.receivedRequests },
                ]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
              <SectionList
                tabLabel='Sent'
                ListFooterComponent={<Text style={{textAlign: 'center', padding: 30}}>It feels a bit empty in here. Tap on the plus button to send meal requests to your friends!</Text>}
                renderItem={this.renderSentRequest}
                onRefresh={this.refreshSent}
                refreshing={this.state.refreshingS}
                sections={[]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
            </ScrollableTabView>
              {this.requestModal()}
              {this.respondModal()}
              {this.undoModal()}
              {this.receivedGroupRequestModal()}
              {this.sentGroupRequestModal()}
              {this.acceptedGroupRequestModal()}
          </View>
          )
      } else {
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
              <SectionList
                tabLabel='Received'
                onRefresh={this.refreshReceived}
                refreshing={this.state.refreshingR}
                renderItem={this.renderReceivedRequest}
                sections={[
                  { title: 'Groups', data: this.state.receivedGroupRequests, renderItem: this.renderReceivedGroupRequest },
                  { title: 'Friends', data: this.state.receivedRequests },
                ]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
              <SectionList
                tabLabel='Sent'
                renderItem={this.renderSentRequest}
                onRefresh={this.refreshSent}
                refreshing={this.state.refreshingS}
                sections={[
                  { title: 'Groups', data: this.state.sentGroupRequests, renderItem: this.renderSentGroupRequest },
                  { title: 'Friends', data: this.state.sentRequests },
                ]}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              />
            </ScrollableTabView>
              {this.requestModal()}
              {this.respondModal()}
              {this.undoModal()}
              {this.receivedGroupRequestModal()}
              {this.sentGroupRequestModal()}
              {this.acceptedGroupRequestModal()}
          </View>
        )}
    } else {
      return (
      <View>
          <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )}
  }

  requestModal() {
    return <View>
    <Modal onRequestClose={() => this.setState({newRequestModalVisible: false})} transparent={true} visible={this.state.newRequestModalVisible}>
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
              onPress={() => this.setState({newRequestModalVisible: false})}>
              <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </Modal>
    </View>
  }
  undoModal() {
    return <View>
    <Modal onRequestClose={() => this.setState({undoVisible: false})} transparent={true} visible={this.state.undoVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 480,
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
        <Text>{this.state.curUser.displayDate} {this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        {this.state.curUser.conflict && <Text style = {{color:'red', textAlign: 'center'}}>You have a conflicting meal scheduled already!</Text>}
        </View>
        </View>
        {!this.state.curUser.conflict && <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5bc0de", borderRadius: 5}}
            onPress={this.changeSentLocation}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Change Location</Text>
          </TouchableHighlight>
        </View>}
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleSentRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.cancelRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Request</Text>
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
    </View>
  }
  respondModal() {
    return (
    <Modal onRequestClose={() => this.setState({respondVisible: false})} transparent={true} visible={this.state.respondVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 540,
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
        <Text>{this.state.curUser.displayDate} {this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        {this.state.curUser.conflict && <Text style = {{color:'red', textAlign: 'center'}}>You have a conflicting meal scheduled already!</Text>}
        </View>
        </View>
        {!this.state.curUser.conflict && <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5cb85c", borderRadius: 5}}
            onPress={this.acceptRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Accept</Text>
          </TouchableHighlight>
        </View>}
        {!this.state.curUser.conflict && <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5bc0de", borderRadius: 5}}
            onPress={this.changeLocation}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Change Location</Text>
          </TouchableHighlight>
        </View>}
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
    )
  }
  receivedGroupRequestModal() {
    if (this.state.curUser.groupName === "") {
      var names = [];
      for (var memberID in this.state.curUser.members) {
        if (memberID != userID)
          names.push(this.state.curUser.members[memberID].name.split(" ")[0]);
      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {displayName = this.state.curUser.groupName}
    if (this.state.curUser.missingPerson)
      displayName += this.state.curUser.missingPerson
    return (
    <Modal
      onRequestClose={() => this.setState({respondGroupReceived: false})}
      transparent={true}
      visible={this.state.respondGroupReceived}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
      }}>
        <View style={{
          width: 300,
          height: 500,
          backgroundColor: '#fff',
          padding: 30
        }}>
        <ScrollView>
        <View style={{alignItems:'center'}}>
          <Text>{'Respond to group meal request with'}</Text>
          <Text style={{fontWeight:'bold', fontSize:20, padding:5, textAlign:'center'}}>{displayName}</Text>
          <Text style={{textAlign: 'center'}}>
            {this.state.displayDate + " " + this.state.curUser.TimeString + " at " + this.state.curUser.Location}
          </Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Text style={{padding:5}}>Accepted</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('accepted')}
            </ScrollView>
          </View>
          <Text style={{padding:5}}>Pending</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent ={true}
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('pending')}
            </ScrollView>
          </View>
          <Text style={{padding:5}}>Declined</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('declined')}
            </ScrollView>
          </View>
        </View>
        <TouchableHighlight
          style={{marginTop:10,padding: 10, backgroundColor: "#5cb85c", borderRadius: 5}}
          onPress={this.acceptGroupRequest}>
          <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Accept</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={{marginTop:10,padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
          onPress={this.declineGroupRequest}>
          <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Decline</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={{marginTop:30,padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
          onPress={() => this.setState({respondGroupReceived: false})}>
          <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
        </TouchableHighlight>
        </ScrollView>
        </View>
      </View>
    </Modal>
      )
  }
  acceptedGroupRequestModal() {
    if (this.state.curUser.groupName === "") {
      var names = [];
      for (var memberID in this.state.curUser.members) {
        if (memberID != userID)
          names.push(this.state.curUser.members[memberID].name.split(" ")[0]);
      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {displayName = this.state.curUser.groupName}
    if (this.state.curUser.missingPerson)
      displayName += this.state.curUser.missingPerson
    return (
    <Modal
      onRequestClose={() => this.setState({acceptedGroupReceived: false})}
      transparent={true}
      visible={this.state.acceptedGroupReceived}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
      }}>
        <View style={{
          width: 300,
          height: 400,
          backgroundColor: '#fff',
          padding: 30
        }}>
        <ScrollView>
        <View style={{alignItems:'center'}}>
          <Text>{'Group meal with'}</Text>
          <Text style={{fontWeight:'bold', fontSize:20, padding:5, textAlign:'center'}}>{displayName}</Text>
          <Text style={{textAlign: 'center'}}>
            {this.state.displayDate + " " + this.state.curUser.TimeString + " at " + this.state.curUser.Location}
          </Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Text style={{padding:5}}>Accepted</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('accepted')}
            </ScrollView>
          </View>
          <Text style={{padding:5}}>Pending</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent ={true}
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('pending')}
            </ScrollView>
          </View>
          <Text style={{padding:5}}>Declined</Text>
          <View style={{flexDirection: 'row',}}>
            <ScrollView
              centerContent
              horizontal
              showsHorizontalScrollIndicator = {false}
              >
            {this.renderAvatars('declined')}
            </ScrollView>
          </View>
        </View>
        <TouchableHighlight
          style={{marginTop:30,padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
          onPress={() => this.setState({acceptedGroupReceived: false})}>
          <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Close</Text>
        </TouchableHighlight>
        </ScrollView>
        </View>
      </View>
    </Modal>
    )
  }
  sentGroupRequestModal() {
    if (this.state.curUser.groupName === "") {
      var names = [];
      for (var memberID in this.state.curUser.members) {
        if (memberID != userID)
          names.push(this.state.curUser.members[memberID].name.split(" ")[0]);

      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {
      displayName = this.state.curUser.groupName
    }

    acceptedMemberCount = 0
    for (var memberID in this.state.curUser.members) {
      if (this.state.curUser.members[memberID].accepted === true)
        acceptedMemberCount++
    }
    if (acceptedMemberCount >= 2) {
      finalizeOn = true
    } else {finalizeOn = false}

    if (this.state.curUser.missingPerson)
      displayName += this.state.curUser.missingPerson
    return (
    <Modal
      onRequestClose={() => this.setState({respondGroupSent: false})}
      transparent={true}
      visible={this.state.respondGroupSent}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
      }}>
        <View style={{
          width: 300,
          height: 510,
          backgroundColor: '#fff',
          padding: 30
        }}>
        <ScrollView>
          <View style={{alignItems:'center'}}>
            <Text>{'Group Meal with'}</Text>
            <Text style={{fontWeight:'bold', fontSize:20, padding:5, textAlign:'center'}}>{displayName}</Text>
            <Text style={{textAlign: 'center'}}>
              {this.state.displayDate + " " + this.state.curUser.TimeString + " at " + this.state.curUser.Location}
            </Text>
          </View>
          <View style={{alignItems:'center'}}>
            <Text style={{padding:5}}>Accepted</Text>
            <View style={{flexDirection: 'row',}}>
              <ScrollView
                centerContent
                horizontal
                showsHorizontalScrollIndicator = {false}
                >
              {this.renderAvatars('accepted')}
              </ScrollView>
            </View>
            <Text style={{padding:5}}>Pending</Text>
            <View style={{flexDirection: 'row',}}>
              <ScrollView
                centerContent ={true}
                horizontal
                showsHorizontalScrollIndicator = {false}
                >
              {this.renderAvatars('pending')}
              </ScrollView>
            </View>
            <Text style={{padding:5}}>Declined</Text>
            <View style={{flexDirection: 'row',}}>
              <ScrollView
                centerContent
                horizontal
                showsHorizontalScrollIndicator = {false}
                >
              {this.renderAvatars('declined')}
              </ScrollView>
            </View>
          </View>
          {finalizeOn && <TouchableHighlight
            style={{marginTop:10, padding: 10, backgroundColor: "#5cb85c", borderRadius: 5}}
            onPress={this.finalize}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>
              Finalize
            </Text>
          </TouchableHighlight>
        }
          <TouchableHighlight
            style={{marginTop:10, padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleGroup}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>
              Choose a Different Time
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{marginTop:10, padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.cancelGroup}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>
              Cancel Request
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{marginTop:30, padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
            onPress={() => this.setState({respondGroupSent: false})}>
            <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>
              Cancel
            </Text>
          </TouchableHighlight>
          </ScrollView>
        </View>
      </View>
    </Modal>
    )
  }
  renderAvatars = (s) => {
    selectedURLs = []

    if (s == 'accepted') {
      for (memberID in this.state.curUser.members) {
        if (this.state.curUser.members[memberID].accepted == true) {
          selectedURLs.push(`http://graph.facebook.com/${memberID}/picture?type=small`)
        }
      }
    }
    else if (s == 'pending') {
      for (memberID in this.state.curUser.members) {
        if (this.state.curUser.members[memberID].accepted == false && !this.state.curUser.members[memberID].declined) {
          selectedURLs.push(`http://graph.facebook.com/${memberID}/picture?type=small`)
        }
      }
    }
    else if (s == 'declined'){
      for (memberID in this.state.curUser.members) {
        if (this.state.curUser.members[memberID].declined == true) {
          selectedURLs.push(`http://graph.facebook.com/${memberID}/picture?type=small`)
        }
      }
    }

    return (
      selectedURLs.map((url)=> {
        return <Avatar
            small
            rounded
            key = {url}
            source={{uri: url}}
            containerStyle = {{margin:5}}
            // activeOpacity={0.7}
          />
      })
    )
  }

  // FRIEND functions
  renderSentRequest = ({item, index}) => {
    return <ListItem
    key={index}
    title={item.FriendName}
    subtitle={item.DateTime.toDateString().substring(0,10) + " " + item.TimeString + " at " + item.Location}
    subtitleNumberOfLines={2}
    containerStyle={{backgroundColor: item.conflict ? "red": "white"}}
    leftIcon = {
      <Image
        style={{width: 50, height: 50, borderRadius:25, marginRight:10}}
        source={{uri:item.url}} />
      }
    onPress={() => this._onPressSent(item)}
    />;
  }

  renderReceivedRequest = ({item, index}) => {
    return <ListItem
    key={index}
    title={item.FriendName}
    subtitle={item.DateTime.toDateString().substring(0,10) + " " + item.TimeString + " at " + item.Location}
    subtitleNumberOfLines={2}
    containerStyle={{backgroundColor: item.conflict ? "red": "white"}}
    leftIcon = {
      <Image
        style={{width: 50, height: 50, borderRadius:25, marginRight:10}}
        source={{uri:item.url}} />
    }
    onPress={() => this._onPressReceived(item)}
    />;
  }

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
        DateTime: item.DateTime,
        dateobj: item.DateTime.toDateString(),
        conflict: item.conflict,
        displayDate: item.DateTime.toDateString().substring(0,10)}});
  }

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
        DateTime: item.DateTime,
        dateobj: item.DateTime.toDateString(),
        conflict: item.conflict,
        displayDate: item.DateTime.toDateString().substring(0,10)}});
  }

  acceptRequest = () => {
    console.log(this.state.curUser.docID)
    data = new Object()
    data['DateTime'] = this.state.curUser.DateTime
    data['FriendID'] = this.state.curUser.FriendID
    data['FriendName'] = this.state.curUser.FriendName
    data['Length'] = this.state.curUser.Length
    data['Location'] = this.state.curUser.Location
    data['TimeString'] = this.state.curUser.TimeString

    day = weekdays[data['DateTime'].getDay()].day
    amPM = data['DateTime'].getHours() >= 12 ? "PM" : "AM"
    hours = (data['DateTime'].getHours() % 12 || 12) + ":" + ("0" + data['DateTime'].getMinutes()).slice(-2) + " " + amPM
    index = data_flip[hours]

    // update freetimes
    freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(day);
    freetimeRef.get().then(function(doc) {
      freetimeData = doc.data();
      freetimeData['Freetime'][index] = 2
      if (data['Length'] === 1) {
        freetimeData['Freetime'][index+1] = 2
      }
      // console.log("my data", freetimeData)
    freetimeRef.set(freetimeData).then(() => {
      console.log("My Document updated");
      })
      .catch(function(error) {
        console.error("Error updating", error);
      });
    })

    freetimeRef_other = db.collection("users").doc(data['FriendID']).collection('Freetime').doc(day);
    freetimeRef_other.get().then(function(doc) {
      freetimeData_other = doc.data();
      freetimeData_other['Freetime'][index] = 2
      if (data['Length'] === 1) {
        freetimeData_other['Freetime'][index+1] = 2
      }
      // console.log(freetimeData_other)
    freetimeRef_other.set(freetimeData_other).then(() => {
      console.log("Document updated");
      })
      .catch(function(error) {
        console.error("Error updating", error);
      });
    })

    // increment number of meals between two users
    friendRef = db.collection("users").doc(userID).collection('Friends').doc(data['FriendID'])
    friendRef.get().then(function(doc) {
      friendData = doc.data();
      if (!friendData['numOfMeals']) {
        friendRef.set({
          numOfMeals: 1
        }, {merge: true})
      } else {
        friendData['numOfMeals']++
        friendRef.update(friendData)
      }
    })

    friendRef_toMe = db.collection("users").doc(data['FriendID']).collection('Friends').doc(userID)
    friendRef_toMe.get().then(function(doc) {
    friendData_toMe = doc.data();
      if (!friendData_toMe['numOfMeals']) {
        friendRef_toMe.set({
          numOfMeals: 1
         }, {merge: true})
      } else {
        friendData_toMe['numOfMeals']++
        friendRef_toMe.update(friendData_toMe)
      }
    })

    // put document in meals
    db.collection("users").doc(userID).collection('Meals').add(data)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            data['FriendName'] = userName
            data['FriendID'] = userID
            console.log("put document in meals!!!")
            db.collection("users").doc(this.state.curUser.FriendID).collection('Meals').doc(docRef.id).set(data)
            expotoken = "";
                db.collection("users").doc(this.state.curUser.FriendID).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION: " + userName + " accepted meal request");
                return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `${userName} accepted your meal request!`,
                    data: { message: `${userName} accepted your meal request!` },
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                });
                }
              })
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

  declineRequest = () => {
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.FriendID).collection('Sent Requests').doc(this.state.curUser.docID).delete()
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

  changeLocation = () => {
    this.setState({respondVisible: false});
    member = new Object();
    member[this.state.curUser.FriendID] = this.state.curUser.FriendName;
    this.props.navigation.navigate('FinalRequest', {
      sent: false,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      members: member,
      dateobj: this.state.curUser.dateobj,
      time: this.state.curUser.TimeString,
      length: this.state.curUser.Length,
    });
  }

  changeSentLocation = () => {
    this.setState({undoVisible: false});
    member = new Object();
    member[this.state.curUser.FriendID] = this.state.curUser.FriendName;
    this.props.navigation.navigate('FinalRequest', {
      sent: true,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      members: member,
      dateobj: this.state.curUser.dateobj,
      time: this.state.curUser.TimeString,
      length: this.state.curUser.Length,
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

  // GROUP functions
  renderReceivedGroupRequest = ({item, index}) => {
    urls = []
    totalCount = Object.keys(item.members).length
    acceptedCount = 0
    for (memberID in item.members) {
      if (item.members[memberID].accepted == true) {
        acceptedCount++
      }
      if (memberID != userID)
        urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
    }
    if (urls.length == 2)
      urls.push(`http://graph.facebook.com/${userID}/picture?type=normal`)

    if (item.groupName === "") {
      var names = [];
      for (var memberID in item.members) {
        if (memberID != userID)
          names.push(item.members[memberID].name.split(" ")[0]);
      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {displayName = item.groupName}

    if (item.missingPerson)
      displayName += item.missingPerson

    if (item.members[userID].accepted) {
      onPress = () => this.onPressGroupAccepted(item)
      title = `${displayName} - You accepted - ${acceptedCount}/${totalCount}`
      subtitle = `${item.DateTime.toDateString().substring(0,10)} ${item.TimeString} at ${item.Location}`
    }
    else {
      onPress = () => this._onPressGroupReceived(item)
      title = `${displayName} - ${acceptedCount} out of ${totalCount} accepted`
      subtitle = `${item.DateTime.toDateString().substring(0,10)} ${item.TimeString} at ${item.Location}`
    }
    return <ListItem
    key={index}
    title={title}
    subtitle={subtitle}
    subtitleNumberOfLines={5}
    leftIcon = {
      <View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10, borderRadius:25}} >
          <View style={{overflow: 'hidden', borderTopLeftRadius: 25, borderBottomLeftRadius: 25}}>
            <Image
              style={{width: 25, height: 50,}}
              source={{uri:urls[0]}} />
          </View>
          <View style ={{overflow: 'hidden', borderTopRightRadius: 25, borderBottomRightRadius: 25}}>
            <Image
              style={{width: 25, height: 25, }}
              source={{uri:urls[1]}} />
            <Image
              style={{width: 25, height: 25, }}
              source={{uri:urls[2]}}/>
          </View>
        </View>
      }
    onPress={onPress}
    />;
  }

  renderSentGroupRequest = ({item, index}) => {
    console.log("MEMBERS")
    console.log(item.members)
    urls = []
    totalCount = Object.keys(item.members).length
    acceptedCount = 0
    for (memberID in item.members) {
      if (item.members[memberID].accepted == true) {
        acceptedCount++
      }
      if (memberID != userID)
        urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
    }
    if (urls.length == 2)
      urls.push(`http://graph.facebook.com/${userID}/picture?type=normal`)

    if (item.groupName === "") {
      var names = [];
      for (var memberID in item.members) {
        if (memberID != userID)
          names.push(item.members[memberID].name.split(" ")[0]);
      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {displayName = item.groupName}

    if (item.missingPerson)
      displayName += item.missingPerson

    return <ListItem
    key={index}
    title={`${displayName} - ${acceptedCount} out of ${totalCount} accepted`}
    subtitle={`${item.DateTime.toDateString().substring(0,10)} ${item.TimeString} at ${item.Location}`}
    subtitleNumberOfLines={5}
    leftIcon = {<View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10, borderRadius:25}} >
          <View style={{overflow: 'hidden', borderTopLeftRadius: 25, borderBottomLeftRadius: 25}}>
            <Image
              style={{width: 25, height: 50,}}
              source={{uri:urls[0]}} />
          </View>
          <View style ={{overflow: 'hidden', borderTopRightRadius: 25, borderBottomRightRadius: 25}}>
            <Image
              style={{width: 25, height: 25, }}
              source={{uri:urls[1]}} />
            <Image
              style={{width: 25, height: 25, }}
              source={{uri:urls[2]}}/>
          </View>
        </View>}
    onPress={() => this._onPressGroupSent(item)}
    />;
  }

  _onPressGroupSent = (item) => {
    displayDate = item.DateTime.toDateString().substring(0,10)
    this.setState({
      respondGroupSent: true,
      curUser: item,
      displayDate: displayDate
    })
  }

  _onPressGroupReceived = (item) => {
    displayDate = item.DateTime.toDateString().substring(0,10)
    this.setState({
      respondGroupReceived: true,
      curUser: item,
      displayDate: displayDate
    });
  }

  onPressGroupAccepted = (item) => {
    displayDate = item.DateTime.toDateString().substring(0,10)
    this.setState({
      acceptedGroupReceived: true,
      curUser: item,
      displayDate: displayDate
    });
  }

  acceptGroupRequest = () => {
    console.log('ACCEPTING GROUP REQUEST')
    console.log(this.state.curUser)
    console.log(this.state.id)
    db.collection('users').doc(this.state.curUser.initiator).collection('Sent Group Requests').doc(this.state.curUser.id).get().then((doc) => {

      if (doc.exists) {
        let data = doc.data()
        data.members[userID].accepted = true

        db.collection('users').doc(this.state.curUser.initiator).collection('Sent Group Requests').doc(this.state.curUser.id).set(data).then(()=> {
          data['pending'] = true
          for (memberID in this.state.curUser.members) {
            if (memberID != this.state.curUser.initiator) {
              db.collection('users').doc(memberID).collection('Received Group Requests').doc(this.state.curUser.id).set(data)
            }
            if (memberID != userID && data.members[userID].accepted) {
              expotoken = "";
              db.collection("users").doc(memberID).get().then(function(doc) {
                expotoken = doc.data().Token;
                console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION " + userName + " accepted meal to " + memberID);
                  return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `${userName} accepted your group meal request!`,
                    data: { message: `${userName} accepted your group meal request!` },
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                });
                }
              })
            }
          }

          day = weekdays[data['DateTime'].getDay()].day
          amPM = data['DateTime'].getHours() >= 12 ? "PM" : "AM"
          hours = (data['DateTime'].getHours() % 12 || 12) + ":" + ("0" + data['DateTime'].getMinutes()).slice(-2) + " " + amPM
          index = data_flip[hours]

          // update freetimes
          freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(day);
          freetimeRef.get().then((doc) => {
            freetimeData = doc.data();
            freetimeData['Freetime'][index] = 2
            if (data['Length'] === 1) {
              freetimeData['Freetime'][index+1] = 2
            }
            // console.log("my data", freetimeData)
          freetimeRef.set(freetimeData).then(() => {
            console.log("My Document updated");
            })
            .catch(function(error) {
              console.error("Error updating", error);
            });
          })

        })
      }
      else {
        db.collection('users').doc(this.state.curUser.initiator).collection('Meals').doc(this.state.curUser.id).get().then((doc) => {
          if (doc.exists) {
            let data = doc.data()
            for (memberID in data.members) {
              if (data.members[memberID].accepted == true)
                db.collection("users").doc(memberID).collection('Meals').doc(doc.id).update({
                  [`members.${userID}.accepted`]: true
                })
            }
          }
          db.collection("users").doc(userID).collection('Received Group Requests').doc(this.state.curUser.id).delete()
        })
      }

    })
    this.setState({respondGroupReceived: false})
  }

  declineGroupRequest = () => {
    db.collection('users').doc(userID).collection('Received Group Requests').doc(this.state.curUser.id).update({
      declined: true
    }).then(()=>{
      db.collection('users').doc(this.state.curUser.initiator).collection('Sent Group Requests').doc(this.state.curUser.id).get().then((doc) => {
        data = doc.data()
        data.members[userID].declined = true
        db.collection('users').doc(this.state.curUser.initiator).collection('Sent Group Requests').doc(this.state.curUser.id).set(data).then(()=>{
          for (memberID in this.state.curUser.members) {
            if (memberID != this.state.curUser.initiator)
              db.collection('users').doc(memberID).collection('Received Group Requests').doc(this.state.curUser.id).set(data)
          }
        })
      })
    })
    this.setState({respondGroupReceived: false})
  }

  finalize = () => {
    this.setState({respondGroupSent: false})
    for (memberID in this.state.curUser.members) {
      if (memberID == userID)
        db.collection("users").doc(userID).collection('Sent Group Requests').doc(this.state.curUser.id).delete()
      else if (this.state.curUser.members[memberID].accepted == true)
        db.collection("users").doc(memberID).collection('Received Group Requests').doc(this.state.curUser.id).delete()
    }
    data = Object.assign({}, this.state.curUser)
    data.isGroup = true

    db.collection("users").doc(userID).collection('Meals').doc(this.state.curUser.id).set(data)
    .then(() => {
      for (memberID in this.state.curUser.members) {
        if (this.state.curUser.members[memberID].accepted == true && memberID != userID)
          db.collection("users").doc(memberID).collection('Meals').doc(this.state.curUser.id).set(data)
      }
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    })
  }

  rescheduleGroup = () => {
    this.setState({respondGroupSent: false})
    this.props.navigation.navigate('GroupChosen', {
      sent: true,
      reschedule: this.state.curUser.id,
      groupName: this.state.curUser.groupName,
      members: this.state.curUser.members,
      id: this.state.curUser.id,
      missingPerson: this.state.curUser.missingPerson
    });
  }

  cancelGroup = () => {
    this.setState({respondGroupSent: false})
    day = weekdays[this.state.curUser.DateTime.getDay()].day
    amPM = this.state.curUser.DateTime.getHours() >= 12 ? "PM" : "AM"
    hours = (this.state.curUser.DateTime.getHours() % 12 || 12) + ":" + ("0" + this.state.curUser.DateTime.getMinutes()).slice(-2) + " " + amPM
    index = data_flip[hours]
    data = Object.assign({}, this.state.curUser)

    db.collection("users").doc(userID).collection('Sent Group Requests').doc(this.state.curUser.id).delete().then(() => {
      console.log("Document successfully deleted**!")
      var freetimeRef = {};
      var freetimeData = {};
      for (let memberID in this.state.curUser.members) {
        console.log("FREEING TIME FOR " + memberID)
        freetimeRef[memberID] = db.collection("users").doc(memberID).collection('Freetime').doc(day);
        freetimeRef[memberID].get().then(function(doc) {
          freetimeData[memberID] = doc.data();
          freetimeData[memberID]['Freetime'][index] = 1
          if (data['Length'] === 1) {
            freetimeData[memberID]['Freetime'][index+1] = 1
          }
        freetimeRef[memberID].update(freetimeData[memberID]).then(() => {
          console.log("My Document updated for " + memberID + " at " + day + " " + index);
          console.log(freetimeData[memberID]);
          })
          .catch(function(error) {
            console.error("Error updating", error);
          });
        })

        if (memberID != userID)
          db.collection("users").doc(memberID).collection('Received Group Requests').doc(this.state.curUser.id).delete()
      }
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    })
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})
