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
  Platform,
  TouchableNativeFeedback,
  Vibration
  } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
import { Ionicons } from '@expo/vector-icons';
import { userName, userID } from '../screens/SignInScreen';
import Prompt from 'rn-prompt';


const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    console.log("NAME")
    console.log(this.props.name)
    this.props.onPressItem(this.props.name, this.props.members, this.props.id);
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
      if (memberID != userID)
        urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
    }
    if (Object.keys(this.props.members).length == 3)
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
     promptVisible: false,
   };

   setModalVisible(visible) {
     this.setState({modalVisible: visible});
   }

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, members, id) => {
    console.log(name)
    this.props.navigation.navigate('GroupChosen', {
      groupName: name,
      members: members,
      id: id
    });
  };

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

  render() {
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
          onPress = {() => this.props.navigation.navigate("AddGroup")}
        />
        <FlatList
          data={this.props.data}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
        {this.renderModal()}
        {this.renderAlert()}
      </View>
    )
  }

  renderAlert() {
    return (
      <Prompt
      title="Enter new group name"
      placeholder={this.state.name}
      // defaultValue="Hello"
      visible={ this.state.promptVisible }
      onCancel={ () => {
        this.setState({modalVisible: false});
        this.setState({promptVisible: false});
      }}
      onSubmit={ (value) => {
        this.setState({groupName:value})
        this.renameGroup(value, this.state.members, this.state.id)
        this.setState({promptVisible: false});
      }}/>
    )
  }

  renderModal() {
    if (this.state.name === "") {
      var names = [];
      for (var memberID in this.state.members) {
        if (memberID != userID)
          names.push(this.state.members[memberID].split(" ")[0]);
      }
      names.sort()
      displayName = ""
      for (let name of names) {
        displayName = displayName + name + ", "
      }
      displayName = displayName.slice(0, -2)
    }
    else {displayName = this.state.name}
    return (
      <Modal
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => this.setState({modalVisible: false})}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000080'}}>
          <View style={{width: 300, height: 300, backgroundColor: 'transparent'}}>
            <TouchableNativeFeedback>
               <View>
               <Text>
               Button!
               </Text>
               </View>
           </TouchableNativeFeedback>
            <Button
              title= {displayName}
              backgroundColor = "white"
              color = "black"
              fontSize = {20}
              disabledTextStyle = {{color:'black', textAlign: 'right'}}
              disabledStyle = {{backgroundColor:'white'}}
              disabled
              onPress={()=> {}}
              />
            <Button
              title="Leave Group"
              backgroundColor = "white"
              color = "black"
              textStyle = {{textAlign:'left'}}
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
              backgroundColor = "white"
              color = "black"
              textStyle = {{textAlign:'left'}}
              onPress = {() => {
                this.setState({modalVisible: false})
                this.setState({promptVisible: true});
              }}
              />
            <Button
              title="Add Members"
              backgroundColor = "white"
              color = "black"
              textStyle = {{textAlign:'left'}}
              onPress = {()=>{
                this.setState({modalVisible: false})
                this.addMember(this.state.name, this.state.members, this.state.id)}}
              />
          </View>
        </View>
      </Modal>
    )
  }


  _onLongPress = (name, members, id, numOfMeals) => {
    Vibration.vibrate(30)
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
          AlertIOS.prompt(
            'Enter new name for group',
            null,
            text => this.renameGroup(text, members, id)
          )
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
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9a56a',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  empty: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
});
