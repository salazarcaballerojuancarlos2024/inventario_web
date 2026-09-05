package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.AssetRepository;
import com.inventario_web.repositorio.PlantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseAdminService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    private static final String CABECERA_ESPERADA = "Tag,Usuario,Tipo,Ubicación,RAM,CPU,Disco,S.O.,Otros";

    

    /**
     * Valida la cabecera e importa masivamente los activos desde el archivo CSV
     */
    @Transactional
    public int importarDesdeCsv(MultipartFile archivo) throws Exception {
        List<Asset> listaNuevos = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            // Eliminar el caracter BOM si el CSV viene codificado en UTF-8 con BOM (muy común en Excel)
            br.mark(1);
            if (br.read() != 0xFEFF) {
                br.reset();
            }

            String primeraLinea = br.readLine();
            if (primeraLinea == null) {
                throw new IllegalArgumentException("El archivo CSV está completamente vacío.");
            }

            // Normalizar separadores y espacios
            String delimitador = primeraLinea.contains(";") ? ";" : ",";
            String[] columnasCabecera = primeraLinea.split(delimitador, -1);
            
            // Reconstruir cabecera limpia para validar
            StringBuilder cabeceraLimpia = new StringBuilder();
            for (int i = 0; i < columnasCabecera.length; i++) {
                cabeceraLimpia.append(columnasCabecera[i].trim());
                if (i < columnasCabecera.length - 1) cabeceraLimpia.append(",");
            }

            if (!cabeceraLimpia.toString().equalsIgnoreCase(CABECERA_ESPERADA)) {
                throw new IllegalArgumentException(
                    "Las columnas del CSV no son válidas.\n\n" +
                    "Deben llamarse exactamente:\n" +
                    "Tag, Usuario, Tipo, Ubicación, RAM, CPU, Disco, S.O., Otros\n\n" +
                    "Cabecera detectada en su archivo:\n" + cabeceraLimpia.toString().replace(",", ", ")
                );
            }

            // Leer filas de datos
            String linea;
            while ((linea = br.readLine()) != null) {
                if (linea.trim().isEmpty()) continue;

                String[] datos = linea.split(delimitador, -1);

                Asset asset = new Asset();
                asset.setAssetTag(getDatoSeguro(datos, 0));
                asset.setNombreUsuario(getDatoSeguro(datos, 1));
                asset.setTipoEquipo(getDatoSeguro(datos, 2));

                // Mapear la columna Ubicación a la entidad Planta
                String nombreUbicacion = getDatoSeguro(datos, 3);
                if (!nombreUbicacion.isEmpty()) {
                    Planta planta = plantaRepository.findByNombre(nombreUbicacion).orElse(null);
                    asset.setPlanta(planta);
                } else {
                    asset.setPlanta(null);
                }

                // Mapear el resto de especificaciones técnicas
                asset.setRam(getDatoSeguro(datos, 4));
                asset.setCpu(getDatoSeguro(datos, 5));
                asset.setDisco(getDatoSeguro(datos, 6));
                asset.setVersionSo(getDatoSeguro(datos, 7));
                asset.setOtros(getDatoSeguro(datos, 8));

                listaNuevos.add(asset);
            }
        }

        assetRepository.saveAll(listaNuevos);
        return listaNuevos.size();
    }

    private String getDatoSeguro(String[] array, int indice) {
        return (indice < array.length) ? array[indice].trim() : "";
    }
}