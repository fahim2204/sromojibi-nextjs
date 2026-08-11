"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, MapPin, Sparkles, Landmark, Building2 } from "lucide-react";
import {
  Input,
  Button,
  Card,
  CardBody,
  Chip,
  Spinner,
  Kbd,
  Skeleton,
} from "@nextui-org/react";

interface Upazila {
  id: string;
  title_bn: string | null;
  title_en: string | null;
}

interface DistrictSummary {
  id: string;
  title_bn: string | null;
  title_en: string | null;
  upazilas?: Upazila[];
}

interface DistrictDetail {
  id: string;
  title_bn: string | null;
  title_en: string | null;
  upazilas: Upazila[];
}

interface Division {
  id: string;
  title_bn: string | null;
  title_en: string | null;
  districts: DistrictSummary[];
}

// Convert English name to clean URL slug e.g. "Mymensingh" -> "mymensingh", "Cox's Bazar" -> "coxs-bazar"
function toSlug(name: string | null): string {
  if (!name) return "all";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AddressHierarchyExplorer() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  // District details cache: districtId -> DistrictDetail
  const [districtDetailsCache, setDistrictDetailsCache] = useState<Record<string, DistrictDetail>>({});
  const [districtLoadingId, setDistrictLoadingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Division[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Keyboard Shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Debounce Search Query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. API Search Call on Debounced Query Change
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    async function performApiSearch() {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/v1/locations/hierarchy?q=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) throw new Error("Search failed");

        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setSearchResults(json.data);
        }
      } catch (err) {
        console.error("Error performing search:", err);
      } finally {
        setIsSearching(false);
      }
    }

    performApiSearch();
  }, [debouncedQuery]);

  // 4. Initial Load: Fetch Divisions + Districts
  useEffect(() => {
    async function fetchDivisionsAndDistricts() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/locations/hierarchy");
        if (!res.ok) throw new Error("Failed to load location data");

        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setDivisions(json.data);
          if (json.data.length > 0) {
            const firstDiv = json.data[0];
            setSelectedDivisionId(firstDiv.id);
            if (firstDiv.districts && firstDiv.districts.length > 0) {
              const firstDistId = firstDiv.districts[0].id;
              setSelectedDistrictId(firstDistId);
              fetchDistrictDetail(firstDistId);
            }
          }
        } else {
          throw new Error(json.error?.message || "Invalid API response");
        }
      } catch (err: any) {
        console.error("Error fetching divisions:", err);
        setError(err.message || "Failed to load location data");
      } finally {
        setLoading(false);
      }
    }

    fetchDivisionsAndDistricts();
  }, []);

  // Fetch District Upazilas when a district is selected
  const fetchDistrictDetail = async (districtId: string) => {
    if (districtDetailsCache[districtId]) {
      return;
    }

    try {
      setDistrictLoadingId(districtId);
      const res = await fetch(`/api/v1/locations/hierarchy?district_id=${districtId}`);
      if (!res.ok) throw new Error("Failed to load district details");

      const json = await res.json();
      if (json.data) {
        setDistrictDetailsCache((prev) => ({
          ...prev,
          [districtId]: json.data,
        }));
      }
    } catch (err: any) {
      console.error(`Error fetching details for district ${districtId}:`, err);
    } finally {
      setDistrictLoadingId(null);
    }
  };

  const handleSelectDistrict = (districtId: string) => {
    setSelectedDistrictId(districtId);
    fetchDistrictDetail(districtId);
  };

  const handleSelectDivision = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    const targetDiv = divisions.find((d) => d.id === divisionId);
    if (targetDiv && targetDiv.districts.length > 0) {
      const firstDistId = targetDiv.districts[0].id;
      setSelectedDistrictId(firstDistId);
      fetchDistrictDetail(firstDistId);
    } else {
      setSelectedDistrictId(null);
    }
  };

  const activeDivision = useMemo(() => {
    if (!selectedDivisionId && divisions.length > 0) {
      return divisions[0];
    }
    return (
      divisions.find((d) => d.id === selectedDivisionId) ||
      divisions[0] ||
      null
    );
  }, [divisions, selectedDivisionId]);

  const activeDistrictSummary = useMemo(() => {
    if (!activeDivision || !selectedDistrictId) return null;
    return activeDivision.districts.find((d) => d.id === selectedDistrictId) || null;
  }, [activeDivision, selectedDistrictId]);

  const activeDistrictDetail = selectedDistrictId
    ? districtDetailsCache[selectedDistrictId]
    : null;

  // Categorize Search Results into Divisions, Districts, and Upazilas for the Dropdown
  const searchCategories = useMemo(() => {
    if (!debouncedQuery || !searchResults) return null;

    const q = debouncedQuery.toLowerCase();
    const matchedDivs: { id: string; title_bn: string | null; title_en: string | null; districtCount: number }[] = [];
    const matchedDists: { id: string; title_bn: string | null; title_en: string | null; divId: string; divName: string; divNameEn: string }[] = [];
    const matchedUpzs: { id: string; title_bn: string | null; title_en: string | null; distId: string; distName: string; distNameEn: string; divId: string; divNameEn: string }[] = [];

    searchResults.forEach((div) => {
      const isDivMatch =
        (div.title_bn && div.title_bn.includes(q)) ||
        (div.title_en && div.title_en.toLowerCase().includes(q));

      if (isDivMatch) {
        matchedDivs.push({
          id: div.id,
          title_bn: div.title_bn,
          title_en: div.title_en,
          districtCount: div.districts.length,
        });
      }

      div.districts.forEach((dist) => {
        const isDistMatch =
          (dist.title_bn && dist.title_bn.includes(q)) ||
          (dist.title_en && dist.title_en.toLowerCase().includes(q));

        if (isDistMatch) {
          matchedDists.push({
            id: dist.id,
            title_bn: dist.title_bn,
            title_en: dist.title_en,
            divId: div.id,
            divName: dist.title_bn || dist.title_en || "",
            divNameEn: dist.title_en || dist.title_bn || "",
          });
        }

        if (dist.upazilas) {
          dist.upazilas.forEach((upz) => {
            const isUpzMatch =
              (upz.title_bn && upz.title_bn.includes(q)) ||
              (upz.title_en && upz.title_en.toLowerCase().includes(q));

            if (isUpzMatch) {
              matchedUpzs.push({
                id: upz.id,
                title_bn: upz.title_bn,
                title_en: upz.title_en,
                distId: dist.id,
                distName: dist.title_bn || dist.title_en || "",
                distNameEn: dist.title_en || dist.title_bn || "",
                divId: div.id,
                divNameEn: div.title_en || div.title_bn || "",
              });
            }
          });
        }
      });
    });

    return {
      divisions: matchedDivs,
      districts: matchedDists,
      upazilas: matchedUpzs,
      total: matchedDivs.length + matchedDists.length + matchedUpzs.length,
    };
  }, [debouncedQuery, searchResults]);

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        <Card className="p-6 md:p-8 border border-slate-200/80 shadow-xs bg-white rounded-3xl">
          <CardBody className="space-y-6 p-0 overflow-hidden">
            <div className="max-w-xl mx-auto w-full">
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <div className="flex flex-wrap gap-2 p-2 bg-slate-100/70 rounded-2xl">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-full" />
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <Skeleton className="h-8 w-44 rounded-xl" />
            <Skeleton className="h-4 w-60 rounded-lg" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-36 rounded-lg" />
            <div className="flex flex-wrap gap-2.5 p-3 bg-slate-100/80 rounded-2xl">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-xl" />
              ))}
            </div>
          </div>

          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl">
            <CardBody className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl w-full" />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 max-w-xl mx-auto border-red-200 bg-red-50 text-center">
        <CardBody className="space-y-4">
          <div className="text-3xl">⚠️</div>
          <h3 className="text-lg font-bold text-red-900">Failed to load location directory</h3>
          <p className="text-xs text-red-700">{error}</p>
          <Button
            color="danger"
            size="sm"
            onClick={() => window.location.reload()}
            className="font-semibold"
          >
            Retry Loading
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Centered Search & Division Selector Card */}
      <Card className="p-6 md:p-8 border border-slate-200/80 shadow-xs bg-white rounded-3xl space-y-6">
        <CardBody className="space-y-6 p-0 overflow-visible">
          {/* Centered Search Bar Container */}
          <div className="max-w-xl mx-auto w-full text-center space-y-3 relative">
            <div className="relative">
              <Input
                ref={inputRef}
                isClearable
                onClear={() => setSearchQuery("")}
                placeholder="Search Division, District, or Upazila..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  isSearching ? (
                    <Spinner size="sm" color="success" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                  )
                }
                endContent={
                  !searchQuery && (
                    <Kbd className="hidden sm:inline-flex text-[10px] bg-slate-100 border border-slate-200">
                      /
                    </Kbd>
                  )
                }
                variant="bordered"
                size="md"
                radius="full"
                classNames={{
                  inputWrapper:
                    "bg-slate-50/80 border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 shadow-2xs",
                  input: "text-sm",
                }}
              />

              {/* Live Search Dropdown Popup */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto text-left space-y-4">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500 font-medium">
                      <Spinner size="sm" color="success" />
                      <span>Searching divisions, districts, and upazilas...</span>
                    </div>
                  ) : searchCategories && searchCategories.total > 0 ? (
                    <>
                      {/* Divisions Section */}
                      {searchCategories.divisions.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                            <Landmark className="w-3 h-3 text-slate-500" /> Divisions ({searchCategories.divisions.length})
                          </div>
                          {searchCategories.divisions.map((div) => (
                            <div
                              key={div.id}
                              onClick={() => {
                                handleSelectDivision(div.id);
                                setSearchQuery("");
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center justify-between transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{div.title_bn}</span>
                                {div.title_en && <span className="text-[11px] text-slate-500">({div.title_en})</span>}
                              </div>
                              <Button
                                as={Link}
                                href={`/workers/division/${toSlug(div.title_en || div.title_bn)}`}
                                size="sm"
                                variant="flat"
                                color="default"
                                radius="lg"
                                className="h-6 text-[10px] font-bold px-2.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Workers
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Districts Section */}
                      {searchCategories.districts.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-100 pt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-emerald-600" /> Districts ({searchCategories.districts.length})
                          </div>
                          {searchCategories.districts.map((dist) => (
                            <div
                              key={dist.id}
                              onClick={() => {
                                handleSelectDivision(dist.divId);
                                handleSelectDistrict(dist.id);
                                setSearchQuery("");
                              }}
                              className="p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition group"
                            >
                              <div>
                                <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                                  {dist.title_bn} {dist.title_en && <span className="font-normal text-slate-500">({dist.title_en})</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  in {dist.divName} Division
                                </div>
                              </div>
                              <Button
                                as={Link}
                                href={`/locations/${toSlug(dist.title_en || dist.title_bn)}`}
                                size="sm"
                                variant="flat"
                                color="success"
                                radius="lg"
                                className="h-6 text-[10px] font-bold px-2.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Workers
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upazilas Section */}
                      {searchCategories.upazilas.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-100 pt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600" /> Upazilas ({searchCategories.upazilas.length})
                          </div>
                          {searchCategories.upazilas.map((upz) => (
                            <div
                              key={upz.id}
                              onClick={() => {
                                handleSelectDivision(upz.divId);
                                handleSelectDistrict(upz.distId);
                                setSearchQuery("");
                              }}
                              className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between transition group"
                            >
                              <div>
                                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-800">
                                  {upz.title_bn} {upz.title_en && <span className="font-normal text-slate-500">({upz.title_en})</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Upazila in {upz.distName} District
                                </div>
                              </div>
                              <Button
                                as={Link}
                                href={`/locations/${toSlug(upz.distNameEn)}/${toSlug(upz.title_en || upz.title_bn)}`}
                                size="sm"
                                variant="flat"
                                color="primary"
                                radius="lg"
                                className="h-6 text-[10px] font-bold px-2.5"
                                endContent={<Sparkles className="w-3 h-3" />}
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Workers
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500 font-medium">
                      No locations found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono text-[10px]">/</kbd> anywhere to focus search
            </p>
          </div>

          {/* Division Selector Buttons */}
          <div>
            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider text-center sm:text-left">
              Select Division
            </div>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-100/70 rounded-2xl border border-slate-200/50 justify-center sm:justify-start">
              {divisions.map((div) => {
                const isSelected = activeDivision?.id === div.id;
                return (
                  <Button
                    key={div.id}
                    size="sm"
                    radius="full"
                    variant={isSelected ? "solid" : "flat"}
                    onClick={() => handleSelectDivision(div.id)}
                    className={`h-9 px-4 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                    }`}
                  >
                    <span>{div.title_bn || div.title_en}</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      className={`h-4 text-[10px] px-1 ml-1 ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {div.districts.length} Districts
                    </Chip>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Selected Division & District Tab Pane */}
      {activeDivision ? (
        <div className="space-y-6">
          {/* Division Title Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>{activeDivision.title_bn}</span>
                {activeDivision.title_en && (
                  <span className="text-sm font-normal text-slate-500">
                    ({activeDivision.title_en})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select a district below to view upazilas.
              </p>
            </div>

            <Button
              as={Link}
              href={`/workers/division/${toSlug(activeDivision.title_en || activeDivision.title_bn)}`}
              color="default"
              size="sm"
              radius="full"
              className="bg-slate-900 text-white font-bold text-xs"
              endContent={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            >
              View Workers in {activeDivision.title_bn}
            </Button>
          </div>

          {/* District Multi-row Button Pane */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Districts in {activeDivision.title_bn} ({activeDivision.districts.length})
            </div>

            <div className="flex flex-wrap gap-2.5 p-3 bg-slate-100/80 rounded-2xl border border-slate-200/80">
              {activeDivision.districts.map((district) => {
                const isSelected = selectedDistrictId === district.id;
                return (
                  <Button
                    key={district.id}
                    size="sm"
                    radius="lg"
                    variant={isSelected ? "solid" : "flat"}
                    onClick={() => handleSelectDistrict(district.id)}
                    className={`h-10 px-3.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-white text-slate-800 hover:bg-slate-200/80 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <span>{district.title_bn}</span>
                    {district.title_en && (
                      <span
                        className={`text-[11px] font-normal ${
                          isSelected ? "text-emerald-100" : "text-slate-500"
                        }`}
                      >
                        ({district.title_en})
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Selected District Upazilas Panel */}
          {activeDistrictSummary && (
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardBody className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {activeDistrictSummary.title_bn} জেলা
                      </h3>
                      {activeDistrictSummary.title_en && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({activeDistrictSummary.title_en})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Showing Upazilas for {activeDistrictSummary.title_bn} District
                    </p>
                  </div>

                  <Button
                    as={Link}
                    href={`/locations/${toSlug(
                      activeDistrictSummary.title_en || activeDistrictSummary.title_bn
                    )}`}
                    color="primary"
                    size="sm"
                    radius="full"
                    className="bg-slate-900 text-white font-bold text-xs"
                    endContent={<Sparkles className="w-3 h-3 text-emerald-400" />}
                  >
                    View Workers in {activeDistrictSummary.title_bn}
                  </Button>
                </div>

                {/* Upazilas Display with Skeleton Loader */}
                {districtLoadingId === activeDistrictSummary.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl w-full" />
                      ))}
                    </div>
                  </div>
                ) : activeDistrictDetail ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span>Upazilas</span>
                      <Chip size="sm" variant="flat" color="default" className="text-[10px] h-5">
                        {activeDistrictDetail.upazilas.length} Upazilas
                      </Chip>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {activeDistrictDetail.upazilas.map((upazila) => (
                        <div
                          key={upazila.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-400 hover:bg-emerald-50/40 transition flex flex-col justify-between space-y-3 group"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                              {upazila.title_bn}
                            </div>
                            {upazila.title_en && (
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {upazila.title_en}
                              </div>
                            )}
                          </div>

                          <Button
                            as={Link}
                            href={`/locations/${toSlug(
                              activeDistrictSummary.title_en || activeDistrictSummary.title_bn
                            )}/${toSlug(upazila.title_en || upazila.title_bn)}`}
                            size="sm"
                            variant="flat"
                            radius="lg"
                            className="h-7 text-[11px] font-bold bg-white text-slate-700 hover:bg-emerald-600 hover:text-white border border-slate-200/80 shadow-2xs group-hover:border-emerald-400 transition-all"
                            endContent={<Sparkles className="w-3 h-3 text-emerald-500 group-hover:text-white" />}
                          >
                            View Workers
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Select a district to view its upazilas.
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
          <CardBody className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">No locations matched your search.</p>
            <Button
              size="sm"
              color="default"
              variant="flat"
              onClick={() => setSearchQuery("")}
              className="font-bold text-xs"
            >
              Clear Search
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
