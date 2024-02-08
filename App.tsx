import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';

type Note = {id: string; text: string};

const App = () => {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const storage = new MMKV();

  const handleAddNote = () => {
    // Ajouter la note dans MMKV et mettre à jour l'état
    const newNote = {id: Date.now().toString(), text: noteText};
    const updatedNotes = [...notes, newNote];
    storage.set('notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    setNoteText('');
    console.log('Ajout de la note', newNote);
    Alert.alert('Note ajoutée');
  };

  const handleDeleteNote = (id: string) => {
    // Supprimer la note de MMKV et mettre à jour l'état
    const updatedNotes = notes.filter(note => note.id !== id);
    storage.set('notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    console.log('Suppression de la note', id);
    Alert.alert('Note supprimée');
  };

  const syncData = () => {
    // Synchroniser les données avec l'API
    const savedNotes = storage.getString('notes');
    console.log("Synchronisation des données avec l'API", savedNotes);
  };

  useEffect(() => {
    // Charger les notes depuis MMKV
    const savedNotes = storage.getString('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
      console.log(notes);
    }

    // Configurer la vérification périodique de la connexion Internet
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncData();
        console.log('connected:', state.isConnected);
        console.log('type :', state.type);
      }
    });
  }, []);

  return (
    // Interface utilisateur pour ajouter et afficher les notes
    <SafeAreaView>
      <View>
        <TextInput
          placeholder="Ajouter une note"
          value={noteText}
          onChangeText={setNoteText}
        />
        <Button title="Ajouter" onPress={handleAddNote} />
      </View>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View>
            <Text>{item.text}</Text>
            <Button
              onPress={() => handleDeleteNote(item.id)}
              title="Supprimer"
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default App;
