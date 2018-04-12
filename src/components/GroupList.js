import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  ActionSheetIOS,
  Alert,
  AlertIOS,
  Modal,
  Platform } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
<<<<<<< HEAD
Cimport { Ionicons } from '@expo/vector-icons';
=======
// import prompt from 'react-native-prompt-android';
import { Ionicons } from '@expo/vector-icons';
>>>>>>> 3e66502dedca65f208bb738a079d80cb25eaf703
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.name, this.props.members);
  };

  _onLongPress = () => {
    this.props.onLongPressItem(this.props.name, this.props.members, this.props.id, this.props.numOfMeals);
  };

  render() {
    var names = [];
    for (var memberID in this.props.members) {
      if (memberID != userID)
        names.push(this.props.members[memberID].split(" ")[0]);
    }
    names.sort()

    var memberStr = ""
    for (name of names) {
      memberStr = memberStr + name + ", "
    }
    memberStr = memberStr.slice(0, -2)

    urls = []
    for (memberID in this.props.members) {
      urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
    }
    urls.push(`http://graph.facebook.com/${userID}/picture?type=normal`)

    if (this.props.name == "") {
      title = memberStr
      memberStr = ""
    } else { title = this.props.name}

    return (
      <ListItem
        title={title}
        subtitle = {memberStr}
        subtitleNumberOfLines = {2}
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
            </View>}
        onPress = {this._onPress}
        onLongPress = {this._onLongPress}
      />
    );
  }
}

export default class MultiSelectList extends React.PureComponent {
  state = {
     modalVisible: false,
   };

   setModalVisible(visible) {
     this.setState({modalVisible: visible});
     console.log('show modal')
     console.log(this.state.modalVisible)
   }


  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, members) => {
    this.props.navigation.navigate('FriendChosen', {
      groupname: name,
      members: members,
    });
  };

  _onLongPress = (name, members, id, numOfMeals) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Leave Group', 'Rename Group', 'Add Members'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          Alert.alert(
            'Leave Group?',
            "You won't be able to get meals with this group anymore.",
            [
              {text: 'Leave', onPress: () => this.leaveGroup(name, members, id, numOfMeals), style:'destructive'},
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: true }
          )}
        if (buttonIndex === 2) {
          // AlertIOS.prompt(
          //   'Enter new name for group',
          //   null,
          //   text => this.renameGroup(text, members, id)
          // )
        }
        if (buttonIndex === 3) {this.addMember(name, members, id)}
        }
      )
    }
    else {
      this.setState({
        name:name,
        members:members,
        id:id,
        numOfMeals:numOfMeals
      })
      this.setModalVisible(true);
    }
  }

  leaveGroup = (name, members, id, numOfMeals) => {
    db.collection("users").doc(userID).collection("Groups").doc(id).delete().then(function() {
        console.log("Document successfully deleted!");
        delete members[userID]
        if (Object.keys(members).length < 3) {
          for (memberID in members) {
            db.collection("users").doc(memberID).collection("Groups").doc(id).delete()
          }
        } else {
          for (memberID in members) {
            // group name change
            db.collection("users").doc(memberID).collection("Groups").doc(id).set({
              groupName: name,
              members: members,
              numOfMeals: numOfMeals
            })
          }
        }
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  }

  renameGroup = (newname, members, id) => {
    for (memberID in members) {
      db.collection("users").doc(memberID).collection("Groups").doc(id).set({
        groupName: newname,
      }, {merge:true})
    }
  }

  addMember = (name, members, id) => {
    this.props.navigation.navigate('AddMember', {
      groupName: name,
      members: members,
      id: id,
    });
  }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      name={item.groupName}
      members = {item.members}
      onPressItem={this._onPressItem}
      onLongPressItem={this._onLongPress}
      numOfMeals={item.numOfMeals}
    />
  );

  addGroup = () => {
    this.props.navigation.navigate("AddGroup")
  }
  renderModal() {
    return (
      <View style={{marginTop: 22}}>
    <Modal
      transparent={true}
      visible={this.state.modalVisible}
      onRequestClose={() => this.setState({modalVisible: false})}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
          <View style={{
            width: 300,
            height: 300,
            backgroundColor: 'transparent',
            // padding: 20
          }}>
              <Button
                title="Leave Group"
                onPress={()=> {
                  Alert.alert(
                    'Leave Group?',
                    "You won't be able to get meals with this group anymore.",
                    [
                      {text: 'Leave', onPress: () => this.leaveGroup(this.state.name, this.state.members, this.state.id, this.state.numOfMeals), style:'destructive'},
                      {text: 'Cancel', onPress: () => this.setState({modalVisible: false}), style: 'cancel'},
                    ],
                    { cancelable: true }
                  )
                  this.setState({modalVisible: false})
                }}
                />
              <Button
                title="Rename Group"
                onPress = {() => {
                  // prompt(
                  //     'Change group name',
                  //     'Enter a new name for you group',
                  //     [
                  //      {text: 'Cancel', onPress: () => this.setState({modalVisible: false}), style: 'cancel'},
                  //      {text: 'OK', onPress: text => this.renameGroup(text, this.state.members, this.state.id)},
                  //     ],
                  //     {
                  //       cancelable: true,
                  //       // placeholder: {this.state.name}
                  //     }
                  // )
                }}
              />
              <Button
                title="Add Members"
                onPress = {()=>{
                  this.setState({modalVisible: false})
                  this.addMember(this.state.name, this.state.members, this.state.id)}}
              />
          </View>
      </View>
    </Modal>
  </View>
    )
  //     <View>
  //   <Modal
  //     onRequestClose={() => this.setState({modalVisible: false})}
  //     transparent={false}
  //     visible={this.state.modalVisible}>
  //     <View style={{
  //       flex: 1,
  //       flexDirection: 'column',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       backgroundColor: '#00000080'}}>
  //       <View style={{
  //         width: 300,
  //         height: 300,
  //         backgroundColor: '#fff', padding: 20}}>
  //           <Button
  //             onPress={()=>
  //               Alert.alert(
  //                 'Leave Group?',
  //                 "You won't be able to get meals with this group anymore.",
  //                 [
  //                   {text: 'Leave', onPress: () => {}, style:'destructive'},
  //                   {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
  //                 ],
  //                 { cancelable: true }
  //               )}
  //             title="Leave Group"/>
  //           <Button onPress = {()=>{}} title="Rename Group"/>
  //           <Button onPress = {this.addMember(name, members, id)} title="Add Members"/>
  //       </View>
  //     </View>
  //   </Modal>
  // </View>;
  }

  render() {
    console.log('group list data')
    console.log(this.props.data)
    return (
      <View style={{flex:1}}>
        <ListItem
          title={'Add Group'}
          titleStyle = {{paddingLeft:10}}
          leftIcon = {<Icon
            name={'ios-people'}
            type = 'ionicon'
            color='#000'
          />}
          hideChevron
          onPress = {this.addGroup}
        />
        <FlatList
          data={this.props.data}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
        {this.renderModal()}


      </View>
    );
  }
}
