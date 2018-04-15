import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar, Picker, TextInput } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

const eating_clubs = ["Cannon", "Cap", "Charter", "Cloister", "Colonial", "Cottage", "Ivy", "Quad",
"Terrace", "TI", "Tower"]
const all_options = ["Wilcox", "Wu", "Rocky", "Mathey", "Whitman", "Frist", "Forbes", "CJL", "Grad College"]

export default class FinalRequestScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: 'Meal Request',
    }
  };

	state = {location: "Wilcox"}

  renderOptions() {
    if (this.state.location == "Eating Clubs") {
      return (<View>
        <Picker
        selectedValue = {"Cannon"}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Cannon" value="Cannon" />
        <Picker.Item label="Cap" value="Cap" />
        <Picker.Item label="Charter" value="Charter" />
        <Picker.Item label="Cloister" value="Cloister" />
        <Picker.Item label="Colonial" value="Colonial" />
        <Picker.Item label="Cottage" value="Cottage" />
        <Picker.Item label="Ivy" value="Ivy" />
        <Picker.Item label="Quad" value="Quad" />
        <Picker.Item label="Terrace" value="Terrace" />
        <Picker.Item label="TI" value="TI" />
        <Picker.Item label="Tower" value="Tower" />
      </Picker>
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    } else if (eating_clubs.indexOf(this.state.location) != -1) {
      return (<View>
      <Picker
        selectedValue = {this.state.location}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Cannon" value="Cannon" />
        <Picker.Item label="Cap" value="Cap" />
        <Picker.Item label="Charter" value="Charter" />
        <Picker.Item label="Cloister" value="Cloister" />
        <Picker.Item label="Colonial" value="Colonial" />
        <Picker.Item label="Cottage" value="Cottage" />
        <Picker.Item label="Ivy" value="Ivy" />
        <Picker.Item label="Quad" value="Quad" />
        <Picker.Item label="Terrace" value="Terrace" />
        <Picker.Item label="TI" value="TI" />
        <Picker.Item label="Tower" value="Tower" />
      </Picker>
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    } else if (all_options.indexOf(this.state.location) != -1) {
      return (<Picker
        selectedValue = {this.state.location}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Wilcox" value="Wilcox" />
        <Picker.Item label="Wu" value="Wu" />
        <Picker.Item label="Rocky" value="Rocky" />
        <Picker.Item label="Mathey" value="Mathey" />
        <Picker.Item label="Whitman" value="Whitman" />
        <Picker.Item label="Frist" value="Frist" />
        <Picker.Item label="Forbes" value="Forbes" />
        <Picker.Item label="CJL" value="CJL" />
        <Picker.Item label="Grad College" value="Grad College" />
        <Picker.Item label="Eating Clubs >" value="Eating Clubs" />
        <Picker.Item label="Custom Location >" value="Custom Location" />
      </Picker>);
    } else {
      return (<View>
      <TextInput
        style = {{height: 40, borderWidth: 0.5, backgroundColor: 'white', margin: 20, padding: 10}}
        onChangeText = {(text) => this.setState({location: text})}
        // value = {this.state.location}
        maxLength = {40}
        placeholder = {"Type your custom location..."}
      />
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    }
  }

	render() {
		const { params } = this.props.navigation.state;
		const name = params ? params.name : null;
    // const friendID = params ? params.id : null;
    const members = params ? params.members : null;
    const time = params ? params.time : null;
    const dateobj = params ? params.dateobj : null;
    const length = params ? params.length : null;
    const firstName = name.split(' ')[0];
    console.log(dateobj)
		return (
			<View style = {{flex:1}}>
			<View style={{justifyContent: "center",alignItems: "center",padding:30}}>
			<Image
         		style={{width: 100, height: 100, borderRadius: 50}}
         		source={{uri: `http://graph.facebook.com/${Object.keys(members)[0]}/picture?type=large`}}
       		/>
			<Text style={{fontSize:20, fontWeight:'bold'}}>{name.split(" ")[0]}</Text>
      <Text style={{fontSize:15}}>{dateobj.substring(0,10)}</Text>
			<Text style={{fontSize:15}}>{time}</Text>
			</View>
			<View style={{justifyContent: "center",alignItems: "center"}}>
			<Text>Select a Location:</Text>
			</View>
      <View style = {{marginBottom:50}}>
        { this.renderOptions() }
      </View>
			<Button title="Submit" backgroundColor='#f4511e' borderRadius={50} raised onPress={this.submitRequest}/>
			</View>
		);
	}

  submitRequest = () => {
    prevData = this.props.navigation.state.params
    reschedule = prevData['reschedule'];
    sent = prevData['sent'];
    data = new Object()
    data['FriendName'] = prevData['name']
    data['FriendID'] = Object.keys(prevData['members'])[0]
    data['Location'] = this.state.location
    data['DateTime'] = new Date(prevData['dateobj'])
    data['Length'] = prevData['length']
    data['TimeString'] = prevData['time']
    if (data['Location'] != "" && data['Location'] != "Custom Location") {
      db.collection("users").doc(userID).collection('Sent Requests').add(data)
          .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
              data['FriendName'] = userName
              data['FriendID'] = userID
              for (let thisid in prevData['members'])
                db.collection("users").doc(thisid).collection('Received Requests').doc(docRef.id).set(data)
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          });
      if (reschedule !== undefined) {
        console.log("RESCHEDULE: " + reschedule);
        if (sent == 2) {
          db.collection("users").doc(userID).collection('Meals').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            for (let thisid in prevData['members'])
              db.collection("users").doc(thisid).collection('Meals').doc(reschedule).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
        else if (sent == true) {
          db.collection("users").doc(userID).collection('Sent Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            for (let thisid in prevData['members'])
              db.collection("users").doc(thisid).collection('Received Requests').doc(reschedule).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        } else {
          db.collection("users").doc(userID).collection('Received Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(Object.keys(prevData['members'])[0]).collection('Sent Requests').doc(reschedule).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      }
      else console.log("NOT RESCHEDULE");
      this.props.navigation.popToTop()
    }
  }
}
