import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const familyPath = path.resolve(process.cwd(), 'data/mock_family_members.json');

const defaultFamily = [
  {
    id: "child-member-1",
    name: "Aryan",
    relation: "child",
    age: 6,
    gender: "male",
    conditions: [],
    allergies: ["nuts"],
    dietary_type: "vegetarian",
    profile_mode: "child",
    is_pregnant: false
  },
  {
    id: "parent-member-1",
    name: "Ramesh",
    relation: "parent",
    age: 62,
    gender: "male",
    conditions: ["hypertension"],
    allergies: [],
    dietary_type: "vegetarian",
    profile_mode: "senior",
    is_pregnant: false
  }
];

function getFamily() {
  try {
    if (fs.existsSync(familyPath)) {
      return JSON.parse(fs.readFileSync(familyPath, 'utf-8'));
    }
  } catch (e) {
    console.error(e);
  }
  return defaultFamily;
}

export async function GET() {
  const family = getFamily();
  return NextResponse.json(family);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const family = getFamily();
    
    const newMember = {
      id: `member-${Date.now()}`,
      ...data
    };
    family.push(newMember);
    
    fs.writeFileSync(familyPath, JSON.stringify(family, null, 2), 'utf-8');
    return NextResponse.json(newMember);
  } catch (err: any) {
    console.error("API Family route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const family = getFamily();
    
    const index = family.findIndex((m: any) => m.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }
    
    family[index] = { ...family[index], ...data };
    fs.writeFileSync(familyPath, JSON.stringify(family, null, 2), 'utf-8');
    return NextResponse.json(family[index]);
  } catch (err: any) {
    console.error("API Family update error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let family = getFamily();
    family = family.filter((m: any) => m.id !== id);
    fs.writeFileSync(familyPath, JSON.stringify(family, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Family delete error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
