-- ARHA-FoodLens Init Database Schema
-- Supabase migration file

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create HARMFUL_SUBSTANCES table (referenced by ingredients and encyclopedia)
CREATE TABLE IF NOT EXISTS harmful_substances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    e_number TEXT,
    ins_number TEXT,
    category TEXT, -- artificial_color, preservative, sweetener, etc.
    risk_level TEXT NOT NULL, -- low, medium, high, very_high
    risk_summary TEXT,
    cancer_risk BOOLEAN DEFAULT FALSE,
    cancer_evidence_level TEXT, -- IARC Group 1, 2A, 2B, 3, etc.
    endocrine_disruptor BOOLEAN DEFAULT FALSE,
    hyperactivity_risk BOOLEAN DEFAULT FALSE,
    unsafe_in_pregnancy BOOLEAN DEFAULT FALSE,
    unsafe_for_children BOOLEAN DEFAULT FALSE,
    kidney_risk BOOLEAN DEFAULT FALSE,
    liver_risk BOOLEAN DEFAULT FALSE,
    thyroid_risk BOOLEAN DEFAULT FALSE,
    status_india TEXT, -- permitted, restricted, banned
    banned_countries TEXT[] DEFAULT '{}',
    restricted_countries TEXT[] DEFAULT '{}',
    who_status TEXT,
    fssai_adi TEXT,
    sources TEXT[] DEFAULT '{}',
    plain_english_explainer TEXT,
    safer_alternative TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create PRODUCTS table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    image_url TEXT,
    label_image_url TEXT,
    serving_size_g NUMERIC DEFAULT 0,
    actual_serving_size_g NUMERIC DEFAULT 0,
    pack_size_g NUMERIC DEFAULT 0,
    is_vegetarian BOOLEAN DEFAULT TRUE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_jain BOOLEAN DEFAULT FALSE,
    is_halal BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    health_score NUMERIC(3,1) DEFAULT 5.0,
    fssai_license TEXT,
    manufacturer TEXT,
    country_of_origin TEXT DEFAULT 'India',
    verified BOOLEAN DEFAULT FALSE,
    data_source TEXT DEFAULT 'manual', -- open_food_facts, manual, community
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create NUTRITION table (linked 1-to-1 or 1-to-many to products, usually 1-to-1 per product)
CREATE TABLE IF NOT EXISTS nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    energy_kcal NUMERIC DEFAULT 0,
    protein_g NUMERIC DEFAULT 0,
    carbohydrates_g NUMERIC DEFAULT 0,
    sugars_g NUMERIC DEFAULT 0,
    added_sugars_g NUMERIC DEFAULT 0,
    fat_g NUMERIC DEFAULT 0,
    saturated_fat_g NUMERIC DEFAULT 0,
    trans_fat_g NUMERIC DEFAULT 0,
    fiber_g NUMERIC DEFAULT 0,
    sodium_mg NUMERIC DEFAULT 0,
    calcium_mg NUMERIC DEFAULT 0,
    iron_mg NUMERIC DEFAULT 0,
    vitamin_a_mcg NUMERIC DEFAULT 0,
    vitamin_c_mg NUMERIC DEFAULT 0,
    maida_percentage NUMERIC DEFAULT 0,
    palm_oil_present BOOLEAN DEFAULT FALSE,
    glycemic_index_estimate NUMERIC DEFAULT 50
);

-- 4. Create INGREDIENTS table
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    e_number TEXT,
    position INTEGER NOT NULL,
    is_allergen BOOLEAN DEFAULT FALSE,
    allergen_type TEXT, -- gluten, nuts, dairy, soy, eggs, etc.
    substance_id UUID REFERENCES harmful_substances(id) ON DELETE SET NULL,
    quantity_percent NUMERIC
);

-- 5. Create USER_PROFILES table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY, -- Maps directly to auth.users.id
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    activity_level TEXT,
    conditions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    dietary_type TEXT DEFAULT 'non_veg',
    goal TEXT DEFAULT 'general',
    medications TEXT[] DEFAULT '{}',
    is_pregnant BOOLEAN DEFAULT FALSE,
    pregnancy_week INTEGER,
    profile_mode TEXT DEFAULT 'adult', -- child, adult, senior
    daily_calorie_target INTEGER DEFAULT 2000,
    daily_sodium_limit_mg INTEGER DEFAULT 2000,
    daily_sugar_limit_g INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create FAMILY_MEMBERS table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL, -- child, spouse, parent, grandparent, etc.
    age INTEGER,
    gender TEXT,
    conditions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    dietary_type TEXT DEFAULT 'non_veg',
    profile_mode TEXT DEFAULT 'adult',
    is_pregnant BOOLEAN DEFAULT FALSE
);

-- 7. Create SCAN_HISTORY table
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    was_consumed BOOLEAN DEFAULT FALSE,
    quantity_consumed NUMERIC DEFAULT 0,
    verdict_score NUMERIC(3,1),
    verdict_json JSONB,
    flagged_substances TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'barcode' -- barcode, ocr, manual_search
);

-- 8. Create FOOD_DIARY table
CREATE TABLE IF NOT EXISTS food_diary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    quantity_g NUMERIC DEFAULT 0,
    consumed_at DATE DEFAULT CURRENT_DATE,
    calories_consumed NUMERIC DEFAULT 0,
    sodium_consumed_mg NUMERIC DEFAULT 0,
    sugar_consumed_g NUMERIC DEFAULT 0,
    harmful_substances_consumed TEXT[] DEFAULT '{}'
);

-- 9. Create FSSAI_ALERTS table
CREATE TABLE IF NOT EXISTS fssai_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    barcode TEXT,
    brand TEXT,
    alert_type TEXT NOT NULL, -- recall, ban, reformulation, warning
    title TEXT NOT NULL,
    description TEXT,
    fssai_reference TEXT,
    issued_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT TRUE,
    source_url TEXT
);

-- 10. Create COMMUNITY_CONTRIBUTIONS table
CREATE TABLE IF NOT EXISTS community_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    barcode TEXT NOT NULL,
    label_image_url TEXT,
    front_image_url TEXT,
    ocr_extracted_text TEXT,
    parsed_data_json JSONB,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID, -- Admin uuid
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- 11. Create PRODUCT_ALTERNATIVES table
CREATE TABLE IF NOT EXISTS product_alternatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    alternative_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reason TEXT,
    category_match BOOLEAN DEFAULT TRUE,
    price_range TEXT DEFAULT 'similar', -- budget, similar, premium
    CONSTRAINT unique_alternatives UNIQUE(product_id, alternative_product_id)
);

-- 12. Create INGREDIENT_ENCYCLOPEDIA table
CREATE TABLE IF NOT EXISTS ingredient_encyclopedia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    aliases TEXT[] DEFAULT '{}',
    e_number TEXT,
    category TEXT,
    what_is_it TEXT,
    what_it_does_to_body TEXT,
    found_in_products TEXT[] DEFAULT '{}',
    harmful_substance_id UUID REFERENCES harmful_substances(id) ON DELETE SET NULL,
    is_harmful BOOLEAN DEFAULT FALSE
);

-- CREATE INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_ingredients_product_id ON ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_substance_id ON ingredients(substance_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_product_id ON scan_history(product_id);
CREATE INDEX IF NOT EXISTS idx_food_diary_user_date ON food_diary(user_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_fssai_alerts_barcode ON fssai_alerts(barcode);
CREATE INDEX IF NOT EXISTS idx_harmful_substances_enum ON harmful_substances(e_number);
CREATE INDEX IF NOT EXISTS idx_encyclopedia_enum ON ingredient_encyclopedia(e_number);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_contributions ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES
-- Profiles Policy: Users can read and write only their own profile
CREATE POLICY user_profile_policy ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Family Members Policy: Users can manage family members linked to their user_id
CREATE POLICY family_members_policy ON family_members
    FOR ALL USING (auth.uid() = user_id);

-- Scan History Policy: Users can see and write their own scan history
CREATE POLICY scan_history_policy ON scan_history
    FOR ALL USING (auth.uid() = user_id);

-- Food Diary Policy: Users can manage their own food diary logs
CREATE POLICY food_diary_policy ON food_diary
    FOR ALL USING (auth.uid() = user_id);

-- Community Contributions: Users can view and insert their own contributions
CREATE POLICY community_contributions_policy ON community_contributions
    FOR ALL USING (auth.uid() = user_id);

-- Publicly Readable Tables (Products, Nutrition, Ingredients, encyclopedia, etc.)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_read_policy ON products FOR SELECT USING (TRUE);

ALTER TABLE nutrition ENABLE ROW LEVEL SECURITY;
CREATE POLICY nutrition_read_policy ON nutrition FOR SELECT USING (TRUE);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY ingredients_read_policy ON ingredients FOR SELECT USING (TRUE);

ALTER TABLE harmful_substances ENABLE ROW LEVEL SECURITY;
CREATE POLICY harmful_substances_read_policy ON harmful_substances FOR SELECT USING (TRUE);

ALTER TABLE ingredient_encyclopedia ENABLE ROW LEVEL SECURITY;
CREATE POLICY ingredient_encyclopedia_read_policy ON ingredient_encyclopedia FOR SELECT USING (TRUE);

ALTER TABLE product_alternatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_alternatives_read_policy ON product_alternatives FOR SELECT USING (TRUE);

ALTER TABLE fssai_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY fssai_alerts_read_policy ON fssai_alerts FOR SELECT USING (TRUE);
