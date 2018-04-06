import React from 'react';
<<<<<<< HEAD
import { View, Image, Text, TouchableHighlight, FlatList } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';

const data = [
{id:0, title: 'Wucox'}, {id:1, title: 'Whitman'}, {id:2, title: 'RoMa'}, {id:3, title: 'Forbes'}, {id:4, title: 'CJL'},
{id:5, title: 'Graduate College'}, {id:6, title: 'Frist Late Meal'}]

export default class FinalRequestScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request</Text></View>}/>
      </View>
    );
  }
}
=======
import { View, Image, Text, TouchableHighlight, Avatar, Picker } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';

export default class FinalRequestScreen extends React.Component {

	state = {location: ""}

	render() {
		const { params } = this.props.navigation.state;
		const name = params ? params.name : null;
		const friendID = params ? params.id : null;
		const url = params ? params.url : null;
		const time = params ? params.time : null;
		const firstName = name.split(' ')[0];
	
		return (
			<View style = {{flex:1}}>
			<NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request with {firstName}</Text></View>}/>
			
			<View style={{justifyContent: "center",alignItems: "center",padding:30}}>
			<Image
         		style={{width: 100, height: 100, borderRadius: 50}}
         		source={{uri: `http://graph.facebook.com/${friendID}/picture?type=large`}}
       		/>
			<Text>{'\nname:'} {name}</Text>
			<Text>time: {time}</Text>
			</View>
			<View style={{justifyContent: "center",alignItems: "center"}}>
			<Text>select a location:</Text>
			</View>

			<Picker 
				selectedValue = {this.state.location} 
				onValueChange = {(itemValue, itemIndex) => this.setState({location: itemValue})}>
  				<Picker.Item label="Forbes" value="Forbes" />
  				<Picker.Item label="Wucox" value="Wucox" />
  				<Picker.Item label="Whitman" value="Whitman" />
  				<Picker.Item label="Roma" value="Roma" />
  				<Picker.Item label="CJL" value="CJL" />
  				<Picker.Item label="Grad College" value="Grad College" />
  				<Picker.Item label="Late Meal" value="Late Meal" />
  			</Picker>
			<Button title="Submit" onPress={() => this.props.navigation.popToTop()}/>
			</View>
			);
		}
	}
>>>>>>> 9fffcbc770e0f94752c5fa9efe0d9cdfaf96003e
