import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button, Alert, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 32.4279,
    longitude: 53.6880,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const fetchDeviceInfo = () => {
      const info = {
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        deviceName: Device.deviceName,
        totalMemory: `${Device.totalMemory / (1024 * 1024)} MB`,
      };
      setDeviceInfo(info);
    };

    const fetchIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        Alert.alert('Error fetching IP address.');
      }
    };

    fetchDeviceInfo();
    fetchIpAddress();
  }, []);

  const findMe = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      // Fetch country, city, and address data using an external API
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&localityLanguage=en`);
      const data = await response.json();
      if (data) {
        if (data.countryName) {
          setCountry(data.countryName);
        }
        if (data.city) {
          setCity(data.city);
        }
      } else {
        Alert.alert('Error fetching location data.');
      }
    } catch (error) {
      Alert.alert('Error fetching location or country data.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.mapContainer}>
        <MapView style={styles.map} region={region}>
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
            />
          )}
        </MapView>
      </TouchableOpacity>
      <View style={styles.overlayContainer}>
        <ScrollView style={styles.overlay}>
      <Text style={styles.subtitle}>github.com/tariux</Text>

          <Text style={styles.title}>{deviceInfo.deviceName}</Text>

          {location && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Latitude:</Text>
                <Text style={styles.value}>{location.coords.latitude}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Longitude:</Text>
                <Text style={styles.value}>{location.coords.longitude}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Country:</Text>
                <Text style={styles.value}>{country}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{city}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>IP Address:</Text>
                <Text style={styles.value}>{ipAddress}</Text>
              </View>

            </>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <TouchableOpacity style={styles.glowingButton} onPress={findMe}>
              <Text style={styles.buttonText}>Find Me</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
        
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  overlay: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  city: {
    fontSize: 18,
    marginBottom: 20,

  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    flex: 1,
  },
  glowingButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
