import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  age: number | null;
  arrivalDate: string | null;
  isWorking: boolean;
  createdAt: string;
};

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET
  async function loadPeople() {
    try {
      const response = await fetch(`${API_URL}/api/personas`);
      if (!response.ok) throw new Error('No se pudo cargar');
      setPeople(await response.json());
      setError(null);
    } catch {
      setError(`No se pudo conectar con ${API_URL}`);
    }
  }

  useEffect(() => {
    loadPeople();
  }, []);

  // POST
  async function addPerson() {
    try {
      const response = await fetch(`${API_URL}/api/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          age: age ? Number(age) : null,
          arrivalDate: new Date().toISOString().slice(0, 10),
          isWorking,
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        setError(body.error ?? 'No se pudo crear');
        return;
      }
      setFirstName('');
      setLastName('');
      setAge('');
      setIsWorking(false);
      setError(null);
      await loadPeople();
    } catch {
      setError('Error de red al crear');
    }
  }

  // PATCH
  async function toggleWorking(person: Person) {
    try {
      const response = await fetch(`${API_URL}/api/personas/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWorking: !person.isWorking }),
      });
      if (!response.ok) {
        const body = await response.json();
        setError(body.error ?? 'No se pudo actualizar');
        return;
      }
      await loadPeople();
    } catch {
      setError('Error de red al actualizar');
    }
  }

  // DELETE
  async function deletePerson(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/personas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        // 204 no tiene body; solo hay JSON si hubo error
        const body = await response.json();
        setError(body.error ?? 'No se pudo eliminar');
        return;
      }
      await loadPeople();
    } catch {
      setError('Error de red al eliminar');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DWARF FORTRESS</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Edad"
        value={age}
        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text style={styles.label}>¿En labores?</Text>
        <Switch value={isWorking} onValueChange={setIsWorking} />
      </View>

      <Pressable style={styles.addButton} onPress={addPerson}>
        <Text style={styles.buttonText}>Agregar</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={people}
        keyExtractor={(person) => String(person.id)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.personCard}>
            <Text style={styles.name}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.age}>
              {item.age != null ? `${item.age} años` : 'Edad desconocida'}
            </Text>
            <Text style={item.isWorking ? styles.working : styles.notWorking}>
              {item.isWorking ? 'EN LABORES' : 'SIN LABOR'}
            </Text>

            <View style={styles.row}>
              <Pressable
                style={styles.toggleButton}
                onPress={() => toggleWorking(item)}
              >
                <Text style={styles.buttonText}>Cambiar labor</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => deletePerson(item.id)}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141311',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    color: '#d08a2c',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f4f1ea',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  label: { color: '#f4f1ea' },
  addButton: {
    backgroundColor: '#d08a2c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  error: { color: '#ff8a80', marginBottom: 10 },
  personCard: {
    backgroundColor: '#f4f1ea',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700' },
  age: { color: '#555', marginTop: 2 },
  working: { color: '#2e6b4a', fontWeight: '700', marginTop: 4 },
  notWorking: { color: '#6e675c', fontWeight: '700', marginTop: 4 },
  toggleButton: {
    flex: 1,
    backgroundColor: '#6e675c',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#b3261e',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});